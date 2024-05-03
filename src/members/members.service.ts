import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { plainToClass } from 'class-transformer';
import * as crypto from 'crypto';
import { Request } from 'express';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { MailService } from 'src/mail/mail.service';
import { MediaService } from 'src/media/media.service';
import { CreateMemberAddressDto } from 'src/member-address/dto/create-member-address.dto';
import { UpdateMemberAddressDto } from 'src/member-address/dto/update-member-address.dto';
import { MemberAddressService } from 'src/member-address/member-address.service';
import { MemberProfileImage } from 'src/member-profile-image/entities/member-profile-image.entity';
import { MemberProfileImageService } from 'src/member-profile-image/member-profile-image.service';
import { MessageChannel } from 'src/message-channel/entities/message-channel.entity';
import { MessageRecipient } from 'src/message-recepient/entities/message-recipient.entity';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { Message } from 'src/messages/entities/messages.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PageViewService } from 'src/page-view/page-view.service';
import { PreferedNotificationService } from 'src/prefered-notifications/prefered-notifications.service';
import { Status } from 'src/statuses/entities/status.entity';
import { StatusEnum } from 'src/statuses/statuses.enum';
import {
  notificationTemplates,
  notificationType,
} from 'src/utils/constants/notifications';
import { StaticPageViewEntityType } from 'src/utils/constants/page-view';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Repository, getRepository } from 'typeorm';
import { UpdateMemberProfileImageDto } from './dto/create-member-profile-image.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberEmailDto } from './dto/update-member-email.dto';
import { UpdateMemberFullNameDto } from './dto/update-member-fullName.dto';
import { UpdateMemberFullnameResponseDto } from './dto/update-member-fullname-response.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './entities/member.entity';
import { PageViewCountryDto } from 'src/page-view/dto/page-view-country.dto';

@Injectable({ scope: Scope.REQUEST })
export class MembersService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
    private memberAddressService: MemberAddressService,
    private mediaService: MediaService,
    private readonly fileUploadsService: FileUploadsService,
    private commonUtilsService: CommonUtilsService,
    private readonly configService: ConfigService,
    private memberProfileImageService: MemberProfileImageService,
    private messageTemplatesService: MessageTemplatesService,
    private notificationsService: NotificationsService,
    private mailService: MailService,
    private readonly preferedNotificationService: PreferedNotificationService,
    private readonly pageViewService: PageViewService,
  ) {}
  /* Create Member  */
  async create(createProfileDto: CreateMemberDto) {
    let member = await this.membersRepository.save(
      this.membersRepository.create(createProfileDto),
    );

    let addressData = new CreateMemberAddressDto();
    addressData.countryId = createProfileDto.countryId;
    addressData.postcode = createProfileDto.postcode;
    await this.memberAddressService.create(member, addressData);

    return member;
  }

  findManyWithPagination(paginationOptions: IPaginationOptions) {
    return this.membersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }
  /* Get Member Name  */
  async findName(id) {
    const record = await this.membersRepository.findOne({
      id: id,
    });
    return record;
  }
  /* Get Member And Member Address information  */
  async findOne(fields) {
    const result = await this.membersRepository.findOne({
      where: fields,
    });
    if (result) {
      const memberAddress = await this.memberAddressService.findMemberAddress(
        result.id,
      );
      result.memberaddress = [memberAddress];
    }
    return result;
  }
  /* Get Member brief Information  */
  async findOneWithMinimalInfo(fields) {
    let result = await this.membersRepository.findOne({
      select: ['id', 'memberuuid', 'email', 'fullName', 'isVerified','provider'],
      where: fields,
    });
    if (result) {
      result.memberprofileimages = null;
      let profilePicData = await this.getMemberProfileImage();
      if (profilePicData) {
        result.memberprofileimages = profilePicData.profilePic;
      }
      const memberAddress = await this.memberAddressService.findMemberAddress(
        result.id,
      );
      result.memberaddress = [memberAddress];
      return {
        id: result.memberuuid,
        email: result.email,
        fullName: result.fullName,
        roleId: result.roleId,
        status: result.status,
        provider: result.provider,
        isVerified: result.isVerified,
        memberprofileimages: result.memberprofileimages,
        memberaddress: result.memberaddress,
      };
    }
    return result;
  }
  /* Get Member Information  */
  async update(member: Member, updateProfileDto: UpdateMemberDto) {
    if(updateProfileDto.countryId){
      let addressData = new UpdateMemberAddressDto();
      addressData.countryId = updateProfileDto.countryId;
      await this.memberAddressService.update(member, addressData);
    }

    return this.membersRepository.save(
      this.membersRepository.create({
        id: member.id,
        modifiedOn: new Date(),
        ...updateProfileDto,
      }),
    );
  }
  /* User Soft Delete */
  async softDelete(id: number): Promise<void> {
    await this.membersRepository.softDelete(id);
  }
  /* Get New Access And Refresh Tokens for User */
  async setCurrentRefreshToken(userId: number, refreshToken: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    return await this.membersRepository.update(
      { id: userId },
      {
        hashedRefreshToken: currentHashedRefreshToken,
      },
    );
  }
  /* Get User By Refresh Token */
  async removeRefreshToken(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.membersRepository.update(
      { email },
      {
        hashedRefreshToken: null,
      },
    );
  }
  /* Member - Close Account */
  async closeAccount(member: Member) {
    const user = await this.membersRepository.findOne(member.id);
    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    const accountClosed = await this.membersRepository.save(
      this.membersRepository.create({
        id: member.id,
        status: {
          id: StatusEnum.closed,
        } as Status,
        modifiedOn: new Date(),
      }),
    );

    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
        member['id'],
      );

    if (!preferedNotification || preferedNotification.isActive) {
      let mailData = {
        to: user.email,
        subject: 'Account Closed',
        text: '',
        template: '/close-account',
        context: {
          userName: await this.commonUtilsService.toTitleCase(user.fullName),
        },
      };

      this.mailService.sendMailCommon(mailData);
    }

    return accountClosed;
  }
  /* Set New Password */
  async setNewPassword(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.membersRepository.update({ email }, { password });
  }
  /* Get User By Email */
  async getUserByEmail(email: string) {
    const user = await this.membersRepository.findOne({ email: email });
    return user;
  }
  /* update User's FullName */
  async updateMemberFullName(
    member: Member,
    updateFullNameDto: UpdateMemberFullNameDto,
  ): Promise<UpdateMemberFullnameResponseDto> {
    let data = await this.membersRepository.save(
      this.membersRepository.create({
        id: member.id,
        modifiedOn: new Date(),
        ...updateFullNameDto,
      }),
    );
    return {
      id: data.id,
      fullName: data.fullName,
    };
  }
  /* update User's Email */
  async updateMemberEmail(
    member: Member,
    updateEmailDto: UpdateMemberEmailDto,
  ) {
    const record = await this.membersRepository.findOne({
      where: {
        email: updateEmailDto.email,
      },
    });

    if (record) {
      if (member.id === record.id) {
        throw new UnprocessableEntityException(
          "Email address can't be same as previous one",
        );
      }
      throw new ConflictException('Email already exists');
    }
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    let memberRecord = await this.membersRepository.save(
      this.membersRepository.create({
        id: member.id,
        status: {
          id: StatusEnum.registered,
        } as Status,
        hash,
        modifiedOn: new Date(),
        isVerified: false,
        ...updateEmailDto,
      }),
    );

    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        notificationTemplates.emailAddressChangedConfirmation,
      );

    if (messageTemplate) {
      if (messageTemplate.emailSms) {
        const recipient = await this.membersRepository.findOne({
          where: {
            id: memberRecord['id'],
          },
        });
        const preferedNotification =
          await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
            notificationType.SYSTEM_NOTIFICATIONS,
            recipient['id'],
          );

        if (!preferedNotification || preferedNotification.isActive) {
          this.mailService.memberSignUp({
            to: recipient.email,
            data: {
              hash,
              fullName: recipient.fullName,
            },
          });
        }
      }
    }

    const messageText = messageTemplate.messageText;
    const messageTitle = messageTemplate.messageTitle;
    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
      );

    await this.notificationsService.create({
      createdBy: member.id,
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: member.id,
      messageTitle,
      messageText,
      isRead: false,
      notificationType: preferedNotification?.notificationTypeId,
    });

    await getRepository(MessageChannel).update(
      { txEmail: member['email'] },
      { txEmail: updateEmailDto.email },
    );
    await getRepository(MessageRecipient).update(
      { recipientEmail: member['email'] },
      { recipientEmail: updateEmailDto.email },
    );
    await getRepository(Message).update(
      { email: member['email'] },
      { email: updateEmailDto.email },
    );

    return {
      email: memberRecord.email,
    };
  }
  /* 'Member - Update Profile Image - PresignedUrl Generator */
  async profileImageUpload(fileInfo: FileUploadUrlDto) {
    const member = this.request.user;
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    //TODO: Validate allowed file format or not
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyImages(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );
    const fileKey = `${this.configService.get(
      'file.s3DirMemberProfileImage',
    )}/${member['id']}/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }
  /* Member - Validate and Update Profile Image */
  async profileImageUpdate(data: UpdateMemberProfileImageDto) {
    //Validate and Set profileImage
    if (data?.profileImageuuid) {
      await this.setProfileImages(data.profileImageuuid);
    }
    return;
  }
  /* Member - Update Profile Image */
  async setProfileImages(fileUuid: string) {
    // Check Profile pic already exist, if yes delete it from S3
    const member = this.request.user;

    let profileImageData = await this.memberProfileImageService.findByMemberId(
      member['id'],
    );
    if (profileImageData) {
      //Mark for Deletion - previous profile image
      await this.mediaService.markForDeletion(profileImageData.mediaId);
    }
    // Set Stallion Profile Image
    let mediaRecord = await this.mediaService.create(fileUuid);
    await this.memberProfileImageService.create(mediaRecord.id);
  }

  /* Get Member Profile Image */
  async getMemberProfileImage() {
    const member = this.request.user;
    let queryBuilder = getRepository(MemberProfileImage)
      .createQueryBuilder('mpi')
      .select('media.mediaUrl as profilePic')
      .innerJoin(
        'mpi.media',
        'media',
        'media.id=mpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .andWhere('mpi.memberId = :memberId', { memberId: member['id'] });
    return await queryBuilder.getRawOne();
  }
  
  /* Get Member Information by field */
  async findByFilelds(fields) {
    return await this.membersRepository.find({
      select: ['id', 'memberuuid', 'email', 'fullName'],
      where: fields,
    });
  }
  /* Update Member Last Active */
  @OnEvent('updateLastActive')
  async updateLastActive(memberId: number) {
    return await this.membersRepository.update(
      { id: memberId },
      {
        lastActive: new Date(),
      },
    );
  }
  /* Get Member By Hash*/
  async findMemberByHash(hash) {
    const result = await this.membersRepository.findOne({
      where: {
        hash: hash,
      },
    });
    return result;
  }
  /* Get Member By memberId*/
  async findOneById(id) {
    const result = await this.membersRepository.findOne({
      where: {
        id: id,
      },
    });
    return result;
  }
  /* Get Member and Address Information  By memberId*/
  async findOneForActivityBymemberId(id: number) {
    let record = await this.membersRepository.findOne({
      id: id,
    });
    if (!record) {
      throw new UnprocessableEntityException('Member not exist!');
    }
    const memberAddress = await this.memberAddressService.findOne(record);
    let countryId = null;
    let stateId = null;
    if (memberAddress) {
      countryId = memberAddress.countryId;
      stateId = memberAddress.stateId;
    }
    return {
      id: record.id,
      fullName: record.fullName,
      email: record.email,
      countryId,
      stateId,
    };
  }
  /* Get Supper Admin  */
  async getSupperAdmin() {
    const supperAdminRoleId = await this.configService.get(
      'file.supperAdminRoleId',
    );
    const supperAdmin = await this.membersRepository.findOne({
      roleId: supperAdminRoleId,
    });

    return supperAdmin;
  }

  /* Update Failed Login Counts */
  async updateFailedLoginCount(userId: number, count: number) {
    return await this.membersRepository.update(
      { id: userId },
      {
        failedLoginAttempts: count,
      },
    );
  }

  /* 
  * Set/Reset Suspended time and status
  */
  async updateSuspendedOn(userId: number, suspendedOn) {
    let status = plainToClass(Status, {
      id: StatusEnum.active,
    })
    if (suspendedOn) {
      status = plainToClass(Status, {
        id: StatusEnum.suspended,
      })
    }
    return await this.membersRepository.update(
      { id: userId },
      {
        suspendedOn: suspendedOn,
        status:status
      },
    );
  }

  /* Capture Home Page View */
  async homePageView(data:PageViewCountryDto) {
    await this.pageViewService.createInit(
      null,
      StaticPageViewEntityType.HOME,
      null,
      data.countryName,
    );
  }

  /* Capture Reports Overview Page View */
  async reportsOverviewPageView(data:PageViewCountryDto) {
    await this.pageViewService.createInit(
      null,
      StaticPageViewEntityType.REPORTOVERVIEW,
      null,
      data.countryName,
    );
  }

  /* Get Member Profile Image By Id */
  async getMemberProfileImageByMemberId(memberId) {
    let queryBuilder = getRepository(MemberProfileImage)
      .createQueryBuilder('mpi')
      .select('media.mediaUrl as profilePic')
      .innerJoin(
        'mpi.media',
        'media',
        'media.id=mpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .andWhere('mpi.memberId = :memberId', { memberId: memberId });
    return await queryBuilder.getRawOne();
  }
}
