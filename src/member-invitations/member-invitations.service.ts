import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Request } from 'express';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { AccessLevel } from 'src/farm-access-levels/access-levels.enum';
import { FarmAccessLevel } from 'src/farm-access-levels/entities/farm-access-level.entity';
import { FarmAccessLevelsService } from 'src/farm-access-levels/farm-access-levels.service';
import { FarmsService } from 'src/farms/farms.service';
import { MailService } from 'src/mail/mail.service';
import { MemberFarmStallion } from 'src/member-farm-stallions/entities/member-farm-stallion.entity';
import { MemberFarmStallionsService } from 'src/member-farm-stallions/member-farm-stallions.service';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { MemberFarmsService } from 'src/member-farms/member-farms.service';
import { MemberInvitationStallionsService } from 'src/member-invitation-stallions/member-invitation-stallions.service';
import { Member } from 'src/members/entities/member.entity';
import { MembersService } from 'src/members/members.service';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PreferedNotificationService } from 'src/prefered-notifications/prefered-notifications.service';
import { StallionsService } from 'src/stallions/stallions.service';
import {
  notificationTemplates,
  notificationType,
} from 'src/utils/constants/notifications';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Repository, getRepository } from 'typeorm';
import { CreateUserInvitationStallionDto } from './dto/create-member-stallion.dto';
import { CreateUserInvitationDto } from './dto/create-user-invitation.dto';
import { GetAllMemberByFarmIdResponseDto } from './dto/get-all-member-by-farm-id-response.dto';
import { RemoveUserInvitationDto } from './dto/remove-member.dto';
import { ResendInvitationDto } from './dto/resend-invitation.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateUserInvitationDto } from './dto/update-member-invitation.dto';
import { ValidateLinkResponseDto } from './dto/validate-link-response.dto';
import { MemberInvitation } from './entities/member-invitation.entity';

@Injectable({ scope: Scope.REQUEST })
export class MemberInvitationsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MemberInvitation)
    private memberInvitationsRepository: Repository<MemberInvitation>,
    private mailService: MailService,
    private farmsService: FarmsService,
    private membersService: MembersService,
    private memberFarmsService: MemberFarmsService,
    private memberInvitationStallionsService: MemberInvitationStallionsService,
    private stallionsService: StallionsService,
    private messageTemplatesService: MessageTemplatesService,
    private notificationsService: NotificationsService,
    private preferedNotificationService: PreferedNotificationService,
    private commonUtilsService: CommonUtilsService,
    private memberFarmStallionsService: MemberFarmStallionsService,
    private farmAccessLevelsService: FarmAccessLevelsService,
    readonly configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  /* Get all farm users by farmId */
  async findAll(
    farmId: string,
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<GetAllMemberByFarmIdResponseDto[]>> {
    let farmRecord = await this.farmsService.getFarmByUuid(farmId);
    let sortByCol = 'name';
    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      sortByCol = sortBy.toLowerCase();
    }

    let entities = await this.memberInvitationsRepository.manager.query(
      `EXEC procGetFarmUsers 
        @farmId=@0,
        @page=@1,
        @size=@2,
        @sortBy=@3`,
      [farmRecord.id, searchOptionsDto.page, searchOptionsDto.limit, sortByCol],
    );

    const records = await entities.filter((res) => res.filterType == 'record');
    const countRecord = await entities.filter(
      (res) => res.filterType == 'total',
    );
    const pageMetaDto = new PageMetaDto({
      itemCount: countRecord[0].totalRecords,
      pageOptionsDto: searchOptionsDto,
    });
    return new PageDto(records, pageMetaDto);
  }

  /* Invite a user to farm */
  async inviteUser(invitationDto: CreateUserInvitationDto) {
    const member = this.request.user;
    // Check FarmId Exist, if yes get the primaryKey using UUID
    let farmRecord = await this.farmsService.getFarmByUuid(
      invitationDto.farmId,
    );
    const record = await this.memberInvitationsRepository.findOne({
      email: invitationDto.email,
      farmId: farmRecord.id,
      isAccepted: true,
      isActive: true,
    });
    if (record) {
      throw new UnprocessableEntityException('Invitation already accepted!');
    }
    //If The Assigned Access in ThirdParty, check stallionIds are valid
    if (invitationDto.accessLevelId == AccessLevel.thirdparty) {
      if (invitationDto.stallionIds.length > 0) {
        invitationDto.stallionIds.forEach(async (element) => {
          await this.stallionsService.getStallionByUuid(element);
        });
      }
    }
    // Check email already exist in member table
    /* Can we Invite a Existing user to a Farm(using FarmAdmin Role)?
     *  If Yes what could be the flow?
     */
    // No need of checking is registered in this step
    const memberRecord = await this.membersService.findOne({
      email: invitationDto.email,
    });
    if (memberRecord) {
      invitationDto.fullName = memberRecord.fullName;
      // Check Member Is Already Part of Invited Farm
      const memberFarmRecord = await this.memberFarmsService.findOne({
        memberId: memberRecord.id,
        farmId: farmRecord.id,
      });
      if (memberFarmRecord) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              hash: `Member is already part of the invited farm!`,
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      } else {
        invitationDto.memberId = memberRecord.id;
      }
    }
    const hashString = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');
    let invitationData = {
      ...invitationDto,
      hash: hashString,
      farmId: farmRecord.id,
      isAccepted: false,
      createdBy: member['id'],
    };
    if (memberRecord) {
      invitationData.memberId = memberRecord?.id;
    }
    //Update Previous Invitation for this email and farm
    await this.memberInvitationsRepository.update(
      {
        email: invitationDto.email,
        farmId: farmRecord.id,
        isAccepted: false,
      },
      {
        isActive: false,
        expiredOn: new Date(),
      },
    );
    let invitation = await this.memberInvitationsRepository.save(
      this.memberInvitationsRepository.create(invitationData),
    );

    if (invitation && invitationDto.accessLevelId == AccessLevel.thirdparty) {
      if (invitationDto.stallionIds.length > 0) {
        invitationDto.stallionIds.forEach(async (element) => {
          let stallion = await this.stallionsService.getStallionByUuid(element);
          let invitationStallionData = {
            memberInvitationId: invitation.id,
            stallionId: stallion.id,
            isActive: true,
            createdBy: member['id'],
          };
          await this.memberInvitationStallionsService.create(
            invitationStallionData,
          );
        });
      }
    }
    const userFullName = await this.commonUtilsService.toTitleCase(
      invitation.fullName,
    );
    const farmName = await this.commonUtilsService.toTitleCase(
      farmRecord.farmName,
    );
    this.mailService.inviteUser({
      to: invitation.email,
      data: {
        hash: invitation.hash,
        fullName: userFullName,
        farmName: farmName,
      },
    });
    let accessLevel = 'Full Access';
    let messageText =
      'Hello {FarmAdminUser}, please accept your invitation to have {accessLevel} to {FarmName}. Once accepted, you will have access to advanced features within the farm dashboard.';

    if (invitationDto.accessLevelId == AccessLevel.thirdparty) {
      accessLevel = 'Third Party Access';
    }
    if (invitationDto.accessLevelId == AccessLevel.viewonly) {
      accessLevel = 'View Only Access';
    }
    const farmMembers = await getRepository(MemberFarm)
      .createQueryBuilder('memberFarm')
      .select(
        'memberFarm.farmId as farmId,member.fullName as fullName,member.id as memberId',
      )
      .innerJoin('memberFarm.member', 'member')
      .andWhere('memberFarm.farmId = :farmId', { farmId: farmRecord.id })
      .getRawMany();

    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
      );

    if (farmMembers.length > 0) {
      const messageTemplate =
        await this.messageTemplatesService.getMessageTemplateByUuid(
          notificationTemplates.notifyOthersForFarmInvite,
        );
      const messageTitle = messageTemplate.messageTitle;
      const member = this.request.user;
      const supperAdminRoleId = this.configService.get(
        'file.supperAdminRoleId',
      );
      const admins = await getRepository(Member).find({
        roleId: supperAdminRoleId,
      });
      admins.forEach(async (recipient) => {
        const messageText = messageTemplate.messageText
          .replace('{userName}', userFullName)
          .replace('{farmName}', farmName);
        const notificationToAdmin = this.notificationsService.create({
          createdBy: member['id'],
          messageTemplateId: messageTemplate?.id,
          notificationShortUrl: 'notificationShortUrl',
          recipientId: recipient.id,
          messageTitle,
          messageText,
          isRead: false,
          notificationType: preferedNotification?.notificationTypeId,
        });
      });

      farmMembers.forEach(async (recipient) => {
        const messageText = messageTemplate.messageText
          .replace('{userName}', userFullName)
          .replace('{farmName}', farmName);
        this.notificationsService.create({
          createdBy: member['id'],
          messageTemplateId: messageTemplate?.id,
          notificationShortUrl: 'notificationShortUrl',
          recipientId: recipient['memberId'],
          messageTitle,
          messageText,
          isRead: false,
          notificationType: preferedNotification?.notificationTypeId,
          farmid: farmRecord.id,
        });
      });
    }
    const inviteOtherMembersMessageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        notificationTemplates.inviteOtherMembersToAFarmUuid,
      );
    messageText = messageText
      .replace('{FarmAdminUser}', userFullName)
      .replace('{FarmName}', farmName)
      .replace('{accessLevel}', accessLevel);
    const messageTitle = inviteOtherMembersMessageTemplate.messageTitle.replace(
      '{farmName}',
      farmName,
    );
    if (invitation.memberId) {
      this.notificationsService.create({
        createdBy: member['id'],
        messageTemplateId: inviteOtherMembersMessageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: invitation.memberId,
        messageTitle,
        messageText,
        actionUrl: hashString, // Setting hash only for the invitation that will be used for accept invitaions.
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
      });
    }
    return invitation;
  }

  /* Get one record */
  findOne(fields) {
    return this.memberInvitationsRepository.findOne({
      where: fields,
    });
  }

  /* Get invitation Hash */
  findHash(fields) {
    return this.memberInvitationsRepository
      .createQueryBuilder('memberinvitation')
      .select(
        'memberinvitation.id as invitationId, memberinvitation.hash as hash',
      )
      .andWhere('memberinvitation.email = :email', { email: fields.email })
      .orderBy('memberinvitation.id', 'DESC')
      .getRawOne();
  }

  /* Get invitation by email */
  async getRecordByEmail(email: string) {
    const user = await this.memberInvitationsRepository.findOne({
      email: email,
    });
    return user;
  }

  /* Validate invitation link */
  async validateInvitationLink(
    hash: string,
  ): Promise<PageDto<ValidateLinkResponseDto[]>> {
    const record = await this.memberInvitationsRepository.findOne({
      hash,
      //isAccepted: false,
    });
    if (!record) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: `Not a valid link!`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    } else {
      if (
        (!record.isAccepted && record.expiredOn < new Date()) ||
        !record.isActive
      ) {
        throw new HttpException(
          {
            status: HttpStatus.GONE,
            errors: {
              hash: `Invitation link expired!`,
            },
          },
          HttpStatus.GONE,
        );
      }
    }
    // Check Member Exist with this invitation Email
    const member = await this.membersService.findOne({
      email: record.email,
    });
    let isMember = false;
    if (member) {
      isMember = true;
      // Check Member Is Already Part of Invited Farm
      const memberFarmRecord = await this.memberFarmsService.findOne({
        memberId: member.id,
        farmId: record.farmId,
      });
      if (memberFarmRecord) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              hash: `Member is already part of the invited farm!`,
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }
    const farm = await this.farmsService.findOne({
      id: record.farmId,
    });
    const response: any = {
      fullName: record.fullName,
      email: record.email,
      isMember: isMember,
      farmName: farm?.farmName,
      farmUuid: farm?.farmUuid,
    };

    return response;
  }

  /* Add Stallions to the member invitation */
  async addMemberStallions(invitationDto: CreateUserInvitationStallionDto) {
    const member = this.request.user;
    // Check FarmId Exist, if yes get the primaryKey using UUID
    let memberInvRecord = await this.memberInvitationsRepository.findOne(
      invitationDto.memberInvitationId,
    );
    if (!memberInvRecord) {
      throw new NotFoundException('Invited Member not exist!');
    }

    const totalResult = [];

    if (invitationDto.stallionIds.length > 0) {
      invitationDto.stallionIds.forEach(async (element) => {
        let stallion = await this.stallionsService.findOne(element);
        let invitationStallionData = {
          memberInvitationId: invitationDto.memberInvitationId,
          stallionId: stallion.id,
          isActive: true,
          createdBy: member['id'],
        };
        totalResult.push(invitationStallionData);
        const memberRecord = await this.memberInvitationStallionsService.create(
          invitationStallionData,
        );
      });
    }

    let invitationData = {
      accessLevelId: 3,
      modifiedBy: member['id'],
    };

    let invitation = await this.memberInvitationsRepository.update(
      { id: invitationDto.memberInvitationId },
      invitationData,
    );

    return invitation;
  }

  /* Remove member invitation */
  async remove(removeDto: RemoveUserInvitationDto) {
    const record = await this.memberInvitationsRepository.findOne({
      id: removeDto.invitationId,
    });
    if (!record) {
      throw new UnprocessableEntityException('Record not exist!');
    }
    const member = this.request.user;
    let currentMemberFarmRecord = await this.memberFarmsService.findOne({
      farmId: record.farmId,
      memberId: member['id'],
    });
    if (record.isAccepted === true) {
      let targetMemberFarmRecord = await this.memberFarmsService.findOne({
        farmId: record.farmId,
        memberId: record.memberId,
      });
      /* Get Current User Access Level
       *  If ReadOnly He can't delete FullAccess Users
       *  If FullAccess he can't delete isFamOwner=1 Records
       */
      if (currentMemberFarmRecord && targetMemberFarmRecord) {
        if (currentMemberFarmRecord.accessLevelId === AccessLevel.viewonly) {
          if (targetMemberFarmRecord.accessLevelId === AccessLevel.fullaccess) {
            throw new ForbiddenException(
              'You do not have sufficient privileges to delete a Full Access user.',
            );
          }
        }
        if (currentMemberFarmRecord.accessLevelId === AccessLevel.fullaccess) {
          if (
            targetMemberFarmRecord.accessLevelId === AccessLevel.fullaccess &&
            targetMemberFarmRecord.isFamOwner === true
          ) {
            throw new ForbiddenException(
              'You do not have sufficient privileges to delete a Full Access user.',
            );
          }
        }
        await getRepository(MemberFarmStallion).delete({
          memberFarmId: targetMemberFarmRecord.id,
        });
        await getRepository(MemberFarm).delete({
          id: targetMemberFarmRecord.id,
        });
      }
    } else {
      //This will restrict even we can't remove pending users if the access level is fullaccess
      if (currentMemberFarmRecord.accessLevelId === AccessLevel.viewonly) {
        if (record.accessLevelId === AccessLevel.fullaccess) {
          throw new ForbiddenException(
            'You do not have sufficient privileges to delete a Full Access user.',
          );
        }
      }
    }
    //Delete Member Invitation Records
    const response = await this.memberInvitationsRepository.manager.query(
      `EXEC proc_SMPDeleteFarmInvitationsOfAMember
      @pFarmId=@0,
      @pEmail=@1`,
      [record.farmId, record.email],
    );
    await this.eventEmitter.emitAsync('deleteInvitationId', {
      fullName: record.fullName,
    });
   // return response;
   return {
    message:'Member removed successfully!'
   }
  }

  /* Update member invitation */
  async updateUser(updateUserInvitationDto: UpdateUserInvitationDto) {
    const member = this.request.user;
    let memberIds = [];
    let invitationData = {
      accessLevelId: updateUserInvitationDto.accessLevelId,
      modifiedBy: member['id'],
      modifiedOn: new Date(),
    };
    const invite = await this.memberInvitationsRepository.findOne({
      id: updateUserInvitationDto.memberInvitationId,
    });

    if (!invite) {
      throw new NotFoundException('Invitation not exist!');
    }
    const level = await getRepository(FarmAccessLevel).findOne({
      id: updateUserInvitationDto.accessLevelId,
    });
    let farm = await this.farmsService.getFarmByUuid(
      updateUserInvitationDto.farmId,
    );
    let currentMemberFarmRecord = await this.memberFarmsService.findOne({
      memberId: member['id'],
      farmId: farm?.id,
    });
    if (invite.isAccepted) {
      if (invite.memberId) {
        const invitedMemberRecord = await this.membersService.findOne({
          id: invite.memberId,
        });
        //Already Accepted
        let memberFarmRecord = await this.memberFarmsService.findOne({
          memberId: invite.memberId,
          farmId: invite.farmId,
        });
        if (
          memberFarmRecord.isFamOwner ||
          currentMemberFarmRecord.accessLevelId > memberFarmRecord.accessLevelId
        ) {
          throw new ForbiddenException(
            'You do not have sufficient privileges to change access level!',
          );
        }
        if (
          currentMemberFarmRecord.accessLevelId >
          updateUserInvitationDto.accessLevelId
        ) {
          // throw new UnauthorizedException('You have no permission to change access level!');
          throw new ForbiddenException(
            'You do not have sufficient privileges to change access level!',
          );
        }
        await this.eventEmitter.emitAsync('changeAcessLevelId', {
          accessLevelId: memberFarmRecord.accessLevelId,
        });

        //Remove Previous Stallions in MemberFarmStallion
        await this.memberFarmStallionsService.deleteByMemberFarmId(
          memberFarmRecord.id,
        );
        //Update MemberFarm/MemberFarmStallion
        let farmAccessLevel = await this.farmAccessLevelsService.findOne(
          updateUserInvitationDto.accessLevelId,
        );
        await this.memberFarmsService.updateOne(memberFarmRecord.id, {
          accessLevelId: updateUserInvitationDto.accessLevelId,
          RoleId: farmAccessLevel.roleId,
          modifiedBy: member['id'],
          modifiedOn: new Date(),
        });
        //BOF Updating Invitation Data
        await this.memberInvitationsRepository.update(
          {
            id: invite.id,
          },
          invitationData,
        );
        await this.memberInvitationStallionsService.removeAllByMemberInvitationId(
          invite.id,
        );
        if (
          invite &&
          updateUserInvitationDto.accessLevelId == AccessLevel.thirdparty
        ) {
          if (updateUserInvitationDto.stallionIds.length > 0) {
            await Promise.all(
              updateUserInvitationDto.stallionIds.map(
                async (element): Promise<any> => {
                  //await updateUserInvitationDto.stallionIds.forEach(async element => {
                  let stallion = await this.stallionsService.getStallionByUuid(
                    element,
                  );
                  let invitationStallionData = {
                    memberInvitationId: invite.id,
                    stallionId: stallion.id,
                    isActive: true,
                    createdBy: member['id'],
                  };
                  await this.memberInvitationStallionsService.create(
                    invitationStallionData,
                  );
                },
              ),
            );
          }
        }
        //EOF Updating Invitation Data
        if (
          memberFarmRecord &&
          updateUserInvitationDto.accessLevelId == AccessLevel.thirdparty
        ) {
          //Insert Records
          await this.memberFarmStallionsService.setStallions(
            invite,
            memberFarmRecord,
          );
        }

        //Send a mail to user who got full access level from level
        if (
          memberFarmRecord.accessLevelId != AccessLevel.fullaccess &&
          updateUserInvitationDto.accessLevelId == AccessLevel.fullaccess
        ) {
          let mailData = {
            to: invitedMemberRecord.email,
            subject: 'Welcome New Admin',
            text: '',
            template: '/farm-new-admin',
            context: {
              farmAdminUser: await this.commonUtilsService.toTitleCase(
                invitedMemberRecord.fullName,
              ),
              farmName: await this.commonUtilsService.toTitleCase(
                farm.farmName,
              ),
              manageUsers:
                process.env.FRONTEND_DOMAIN +
                '/' +
                process.env.FRONTEND_APP_DASHBOARD_URI +
                farm.farmName +
                '/' +
                farm.farmUuid,
              manageAccount:
                process.env.FRONTEND_DOMAIN +
                '/' +
                farm.farmName +
                '/' +
                farm.farmUuid,
            },
          };

          this.mailService.sendMailCommon(mailData);
        }
      }

      if (invite.memberId && invitationData.accessLevelId > 1) {
        const recipient = await getRepository(Member).findOne({
          id: invite.memberId,
        });
        this.sendMailForFarmLevelUpdate(member, level, farm, recipient);
        const admins = await this.membersService.findByFilelds({ roleId: parseInt(process.env.SUPER_ADMIN_ROLE_ID) });

        admins.forEach(async (item) => {
          let fromMeberId = await this.membersService.findOne({ id: item.id });
          memberIds.push(fromMeberId.id);
          if (member['id'] != fromMeberId.id) {
            await this.sendMailForFarmLevelUpdate(
              member,
              level,
              farm,
              fromMeberId,
            );
          }
        });
      } else {
        //Send Email Notification to all farm Admins
        let queryBuilder = getRepository(MemberFarm)
          .createQueryBuilder('memberFarm')
          .select(
            'memberFarm.id, memberFarm.farmId, memberFarm.memberId, memberFarm.accessLevelId',
          )
          .addSelect('member.email as email, member.fullName as fullName')
          .innerJoin('memberFarm.member', 'member')
          .andWhere('memberFarm.farmId = :farmId', {
            farmId: farm.id,
          })
          .andWhere('memberFarm.accessLevelId = 1');
        const farmAdmins = await queryBuilder.getRawMany();
        farmAdmins.forEach(async (item) => {
          let fromMeberId = await this.membersService.findOne({
            id: item.memberId,
          });
          memberIds.push(fromMeberId.id);
          if (member['id'] != fromMeberId.id) {
            await this.updateFarmAdmninPersmissionNotification(
              farm,
              invite,
              fromMeberId,
              level,
            );
          }
        });

        const admins = await this.membersService.findByFilelds({ roleId: parseInt(process.env.SUPER_ADMIN_ROLE_ID) });
        admins.forEach(async (item) => {
          let fromMeberId = await this.membersService.findOne({ id: item.id });
          memberIds.push(fromMeberId.id);
          if (member['id'] != fromMeberId.id) {
            await this.updateFarmAdmninPersmissionNotification(
              farm,
              invite,
              fromMeberId,
              level,
            );
          }
        });
      }
    } else {
      if (
        currentMemberFarmRecord.accessLevelId > invite.accessLevelId ||
        currentMemberFarmRecord.accessLevelId >
          updateUserInvitationDto.accessLevelId
      ) {
        throw new ForbiddenException(
          'You do not have sufficient privileges to change access level!',
        );
      }
      //Pending Invitation
      await this.inviteUser({
        fullName: invite.fullName,
        email: invite.email,
        farmId: farm.farmUuid,
        accessLevelId: updateUserInvitationDto.accessLevelId,
        stallionIds: updateUserInvitationDto.stallionIds,
      });
    }
    if(invite.accessLevelId == 1 || invite.accessLevelId == 2 && updateUserInvitationDto.accessLevelId ==3)
    
      return {
        message: `Admin User's Access Updated Successfully.`,
      }
    
    else
    return {
      message: `User Access Updated Successfully.`,
    };
  }

  /* Send Mail on Farm member access change */
  async sendMailForFarmLevelUpdate(member, level, farm, recipient) {
    const messageTemplateUuid =
      notificationTemplates.farmUserLevelUpdatedOrChanged;

    let messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        messageTemplateUuid,
      );
    const messageText = messageTemplate.messageText
      .replace(
        '{levelName}',
        await this.commonUtilsService.toTitleCase(level.accessName),
      )
      .replace(
        '{FarmName}',
        await this.commonUtilsService.toTitleCase(farm.farmName),
      );
    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
      );

    const messageTitle = messageTemplate.messageTitle;
    await this.notificationsService.create({
      createdBy: member['id'],
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: recipient.id,
      messageTitle,
      messageText,
      isRead: false,
      notificationType: preferedNotification?.notificationTypeId,
    });

    if (messageTemplate) {
      if (messageTemplate.emailSms) {
        const preferedNotification =
          await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
            notificationType.SYSTEM_NOTIFICATIONS,
            recipient.id,
          );

        if (
          !preferedNotification ||
          preferedNotification.isActive ||
          recipient.roleId == parseInt(process.env.SUPER_ADMIN_ROLE_ID)
        ) {
          let mailData = {
            to: recipient.email,
            subject: 'Farm User Level Updated',
            text: '',
            template: '/farm-user-level-update',
            context: {
              farmAdminName: await this.commonUtilsService.toTitleCase(
                recipient.fullName,
              ),
              accessLevel: level.accessName,
              farmName: await this.commonUtilsService.toTitleCase(
                farm.farmName,
              ),
              promotUrl:
                process.env.FRONTEND_DOMAIN +
                '/dashboard/' +
                farm.farmName +
                '/' +
                farm.farmUuid,
            },
          };

          this.mailService.sendMailCommon(mailData);
        }
      }
    }
  }

  /* Update Notification */
  async updateFarmAdmninPersmissionNotification(
    farmDetails,
    memberDetails,
    recipient,
    level,
  ) {
    const member = this.request.user;
    const messageTemplateUuid =
      notificationTemplates.farmUserLevelUpdatedOrChanged;

    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        messageTemplateUuid,
      );
    const messageText = messageTemplate.messageText
      .replace(
        '{levelName}',
        await this.commonUtilsService.toTitleCase(level.accessName),
      )
      .replace(
        '{FarmName}',
        await this.commonUtilsService.toTitleCase(farmDetails.farmName),
      );

    const messageTitle = messageTemplate.messageTitle;
    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
        member['id'],
      );

    this.notificationsService.create({
      createdBy: member['id'],
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: recipient.id,
      messageTitle,
      messageText,
      isRead: false,
      notificationType: preferedNotification?.notificationTypeId,
      farmid: farmDetails.id,
    });

    if (member) {
      if (messageTemplate) {
        if (messageTemplate.emailSms) {
          const preferedNotification =
            await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
              notificationType.SYSTEM_NOTIFICATIONS,
              recipient.id,
            );

          if (
            !preferedNotification ||
            preferedNotification.isActive ||
            recipient.roleId == parseInt(process.env.SUPER_ADMIN_ROLE_ID)
          ) {
            let mailData = {
              to: recipient.email,
              subject: 'Farm Admin changed confirmation',
              text: 'Farm user has changed ',
              template: '/farm-admin',
              context: {
                farmName: farmDetails.farmName,
                fullName: recipient.fullName,
              },
            };
            this.mailService.sendMailCommon(mailData);
          }
        }
      }
    }
  }

  /* Resend Invitation */
  async resendInvitation(resendInvitationDto: ResendInvitationDto) {
    const member = this.request.user;

    let record = await this.memberInvitationsRepository.findOne({
      id: resendInvitationDto.invitationId,
    });
    if (record && record.isAccepted == true) {
      throw new UnprocessableEntityException('Invitation already accepted!');
    }
    let farmRecord = await this.farmsService.findOne({ id: record.farmId });
    if (!farmRecord) {
      throw new NotFoundException('Farm not exist!');
    }
    //BOF Generate New Invitation
    let stallionIds = [];
    if (record.accessLevelId == AccessLevel.thirdparty) {
      let memberInvitationStallionsList =
        await this.memberInvitationStallionsService.getStallionIdsByInvitationId(
          record.id,
        );
      memberInvitationStallionsList.map((record: any) => {
        stallionIds.push(record.stallionId);
      });
    }
    let invitationRecord = await this.inviteUser({
      fullName: record.fullName,
      email: record.email,
      farmId: farmRecord.farmUuid,
      accessLevelId: record.accessLevelId,
      stallionIds,
    });
    //EOF Generate New Invitation
    const userFullName = await this.commonUtilsService.toTitleCase(
      invitationRecord.fullName,
    );
    const farmName = await this.commonUtilsService.toTitleCase(
      farmRecord.farmName,
    );

    if (invitationRecord.memberId) {
      let accessLevel = 'Full Access';
      let messageText = `Hello {FarmAdminUser}, You now have {accessLevel} for {FarmName}, meaning you have full control of the farm and it's stallions.`;

      if (record.accessLevelId == AccessLevel.thirdparty) {
        accessLevel = 'Third Party Access';
        messageText = `Hello {FarmAdminUser}, You now have {accessLevel} for {FarmName},meaning you are able to view stallion specific analytics.`;
      }
      if (record.accessLevelId == AccessLevel.viewonly) {
        accessLevel = 'View Only Access';
        messageText = `Hello {FarmAdminUser}, You now have {accessLevel} for {FarmName},meaning you are able to view all stallion and farm related analytics.`;
      }
      const messageTemplateUuid =
        notificationTemplates.inviteOtherMembersToAFarmUuid;

      const messageTemplate =
        await this.messageTemplatesService.getMessageTemplateByUuid(
          messageTemplateUuid,
        );

      messageText = messageText
        .replace('{FarmAdminUser}', userFullName)
        .replace('{FarmName}', farmName)
        .replace('{accessLevel}', accessLevel);
      const messageTitle = messageTemplate.messageTitle.replace(
        '{farmName}',
        farmName,
      );
      const preferedNotification =
        await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
          notificationType.SYSTEM_NOTIFICATIONS,
        );

      this.notificationsService.create({
        createdBy: member['id'],
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: invitationRecord.memberId,
        messageTitle,
        messageText,
        actionUrl: record.hash, // Setting hash only for the invitation that will be used for accept invitaions
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
      });
    }
    return 'Invitation Sent Successfully';
  }

  /* Get Member Invitation By Id */
  async findMemberInvitationFromId(memberInvitationId) {
    const record = await this.memberInvitationsRepository.findOne({
      id: memberInvitationId,
    });
    if (!record) {
      throw new UnprocessableEntityException('Member does not exist!');
    }
    return record;
  }

  /* Update Invitation */
  async updateInvitaion(fields, updateData) {
    await this.memberInvitationsRepository.update(fields, updateData);
  }
}
