import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Member } from '../members/entities/member.entity';
import * as bcrypt from 'bcryptjs';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { RoleEnum } from 'src/member-roles/roles.enum';
import { StatusEnum } from 'src/statuses/statuses.enum';
import * as crypto from 'crypto';
import { plainToClass } from 'class-transformer';
import { Status } from 'src/statuses/entities/status.entity';
import { AuthProvidersEnum } from './auth-providers.enum';
import { AuthRegisterBreederDto } from './dto/auth-register-breeder.dto';
import { MembersService } from 'src/members/members.service';
import { ForgotService } from 'src/forgot/forgot.service';
import { MailService } from 'src/mail/mail.service';
import { AuthRegisterFarmownerDto } from './dto/auth-register-farmowner.dto';
import { FarmsService } from '../farms/farms.service';
import { CreateFarmDto } from '../farms/dto/create-farm.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interface/jwt-payload.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateFarmMemberDto } from 'src/member-farms/dto/create-farm-member.dto';
import { MemberFarmsService } from 'src/member-farms/member-farms.service';
import { StallionShortlistService } from 'src/stallion-shortlist/stallion-shortlist.service';
import { AuthDto } from './dto/auth.dto';
import { getRepository, In } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MemberInvitationsService } from 'src/member-invitations/member-invitations.service';
import { AuthRegisterFarmmemberDto } from './dto/auth-register-farmmember.dto';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { MemberFarmStallionsService } from 'src/member-farm-stallions/member-farm-stallions.service';
import { EmailExistDto } from './dto/email-exist';
import { CountryService } from 'src/country/service/country.service';
import { MemberAddressService } from 'src/member-address/member-address.service';
import { UpdateAddressDto } from 'src/member-address/dto/update-address.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response-dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response-dto';
import { ResetPasswordLinkResponseDto } from './dto/reset-password-link-response-dto';
import { FarmAccessLevelsService } from 'src/farm-access-levels/farm-access-levels.service';
import { AccessLevel } from 'src/farm-access-levels/access-levels.enum';
import { PreferedNotificationService } from 'src/prefered-notifications/prefered-notifications.service';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { I18nService } from 'nestjs-i18n';
import { AcceptFarmInvitationDto } from './dto/accept-farm-invitation.dto';
import {
  notificationTemplates,
  notificationType,
} from 'src/utils/constants/notifications';
import { SettingService } from 'src/setting/setting.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OAuth2Client } from 'google-auth-library';
import { AuthGoogleLoginDto } from './dto/auth-google-login.dto';
import axios from 'axios';
import { DEFAULT_VALUES } from 'src/utils/constants/common';

const googlClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private jwtService: JwtService,
    private configService: ConfigService,
    private membersService: MembersService,
    private forgotService: ForgotService,
    private mailService: MailService,
    private farmsService: FarmsService,
    private memberFarmsService: MemberFarmsService,
    private StallionShortlistService: StallionShortlistService,
    private memberInvitationsService: MemberInvitationsService,
    private commonUtilsService: CommonUtilsService,
    private messageTemplatesService: MessageTemplatesService,
    private notificationsService: NotificationsService,
    private memberFarmStallionsService: MemberFarmStallionsService,
    private countryService: CountryService,
    private memberAddressService: MemberAddressService,
    private farmAccessLevelsService: FarmAccessLevelsService,
    private preferedNotificationService: PreferedNotificationService,
    private i18n: I18nService,
    private settingService: SettingService,
    private eventEmitter: EventEmitter2,
  ) {}

  /* User Login */
  async validateLogin(
    loginDto: AuthEmailLoginDto,
  ): Promise<AuthLoginResponseDto> {
    const member = await this.membersService.findOne({
      email: loginDto.email,
    });
    const userSuspendConstants = await this.settingService.getData();
    let currentDateTime = new Date();
    let suspensionDateTime = new Date(member.suspendedOn);
    suspensionDateTime.setHours(
      suspensionDateTime.getHours() +
        userSuspendConstants.SM_ACCONT_SUSPENSION_LENGTH,
    );
    if (!member || (member && ![RoleEnum.breeder].includes(member.roleId))) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'User not exists!',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (member.provider !== AuthProvidersEnum.email) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: `${loginDto.email} is registered Via ${member.provider}. Please try with ${member.provider} Login`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      member.password,
    );

    if (isValidPassword) {
      if (member.status.id === StatusEnum.suspended) {
        //Suspension from portal - part of wrong login related suspension
        if (
          currentDateTime <= suspensionDateTime &&
          member.suspendedOn != null
        ) {
          throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              errors: {
                email: `You have exceeded your maximum allowed sign-in attempts. As a security precaution, we have suspended your account for ${userSuspendConstants.SM_ACCONT_SUSPENSION_LENGTH} hours. Please contact support@stallionmatch.com for assistance`,
              },
            },
            HttpStatus.FORBIDDEN,
          );
        }
        //Suspension From - Admin
        if (member.suspendedOn === null) {
          throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              errors: {
                email: `Your account has suspended, Please contact support@stallionmatch.com for assistance`,
              },
            },
            HttpStatus.FORBIDDEN,
          );
        }
        /* Reset Failed Login Count to 0 - If a Successful Login After Failed Login! */
        await this.membersService.updateFailedLoginCount(member.id, 0);
        await this.membersService.updateSuspendedOn(member.id, null);
      }
      if (member.status.id === StatusEnum.closed) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            errors: {
              email: `Your account is closed, please contact Support!`,
            },
          },
          HttpStatus.FORBIDDEN,
        );
      }
      /* Reset Failed Login Count to 0 - If a Successful Login After Failed Login! */
      if (
        member.failedLoginAttempts <=
        userSuspendConstants.SM_PORTAL_LOGIN_ATTEMPT_LIMIT
      ) {
        await this.membersService.updateFailedLoginCount(member.id, 0);
        await this.membersService.updateSuspendedOn(member.id, null);
      }
      // Check invitationKey exist
      // Farm Invitation process for the registered user
      if (loginDto?.invitationKey) {
        const invitation = await this.memberInvitationsService.findOne({
          hash: loginDto?.invitationKey,
        });
        if (!invitation) {
          throw new HttpException(
            {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: {
                hashKey: `Invitation not exist!`,
              },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        } else {
          if (
            !invitation.isAccepted &&
            (await this.commonUtilsService.getUTCTimestampInSeconds(
              invitation.expiredOn,
            )) <
              (await this.commonUtilsService.getUTCTimestampInSeconds(
                new Date(),
              ))
          ) {
            throw new HttpException(
              {
                status: HttpStatus.GONE,
                errors: {
                  hashKey: `Invitation link expired!`,
                },
              },
              HttpStatus.GONE,
            );
          }
        }
        //If Invitation Email and LoggedIn Member email not same return with error
        if (invitation.email !== member.email) {
          throw new HttpException(
            {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: {
                hashKey: `Invitation email and login email not matched!`,
              },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        //If invitation not accepted
        if (!invitation.isAccepted) {
          /* Creating a new record in MemberFarm */
          let farmAccessLevel = await this.farmAccessLevelsService.findOne(
            invitation.accessLevelId,
          );
          let farmMember = new CreateFarmMemberDto();
          farmMember.farmId = invitation.farmId;
          farmMember.memberId = member.id;
          farmMember.accessLevelId = invitation.accessLevelId;
          farmMember.RoleId = farmAccessLevel.roleId;
          farmMember.isFamOwner = false;
          farmMember.createdBy = invitation.createdBy;
          let memberFarmRecord = await this.memberFarmsService.create(
            farmMember,
          );
          // invitation.accessLevelId - 3 For ThirdParty Access
          if (invitation.accessLevelId === AccessLevel.thirdparty) {
            await this.memberFarmStallionsService.setStallions(
              invitation,
              memberFarmRecord,
            );
          }
          invitation.isAccepted = true;
          invitation.memberId = member.id;
          await invitation.save();
        }
      }
      //If not verified.
      if (!member.isVerified) {
        const messageTemplate =
          await this.messageTemplatesService.getMessageTemplateByUuid(
            notificationTemplates.pleaseConfirmYourAccount,
          );
        const messageText = messageTemplate.messageText;
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
          recipientId: member['id'],
          messageTitle,
          messageText,
          isRead: false,
          notificationType: preferedNotification?.notificationTypeId,
        });
      }
      const tokenData = await this.getNewAccessAndRefreshToken({
        id: member.id,
        roleId: member.roleId,
        email: member.email,
      });

      let myObj = { myFarms: null, stallionShortlistCount: 0 };
      const stallionShortlist =
        await this.StallionShortlistService.getSSCountByMemberId(member.id);
      myObj.stallionShortlistCount = stallionShortlist;
      let memberData = {
        id: member.memberuuid,
        email: member.email,
        fullName: member.fullName,
        roleId: member.roleId,
        status: member.status,
        provider: member.provider,
        memberaddress: member.memberaddress,
      };

      const farms = await this.memberFarmsService.getMemberFarmsByMemberId({
        memberId: member.id,
      });
      await this.membersService.updateLastActive(member.id);
      if (farms.length > 0) {
        myObj.myFarms = farms;
        return { ...tokenData, ...myObj, member: memberData };
      }
      return { ...tokenData, ...myObj, member: memberData };
    } else {
      this.request['user'] = member;
      await this.eventEmitter.emitAsync('LoginFailed', {
        originalData: this.request,
      });
      if (member.status.id === StatusEnum.suspended) {
        //Suspension from portal - part of wrong login related suspension
        if (
          currentDateTime <= suspensionDateTime &&
          member.suspendedOn != null
        ) {
          throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              errors: {
                email: `You have exceeded your maximum allowed sign-in attempts. As a security precaution, we have suspended your account for ${userSuspendConstants.SM_ACCONT_SUSPENSION_LENGTH} hours. Please contact support@stallionmatch.com for assistance`,
              },
            },
            HttpStatus.FORBIDDEN,
          );
        }
        //Suspension From - Admin
        if (member.suspendedOn === null) {
          throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              errors: {
                email: `Your account has suspended, Please contact support@stallionmatch.com for assistance`,
              },
            },
            HttpStatus.FORBIDDEN,
          );
        }
        /* Reset Failed Login Count to 0 - If a Successful Login After Failed Login! */
        await this.membersService.updateFailedLoginCount(member.id, 0);
        await this.membersService.updateSuspendedOn(member.id, null);
      } else {
        const failedLoginAttempts = member.failedLoginAttempts + 1;
        if (
          failedLoginAttempts >
          userSuspendConstants.SM_PORTAL_LOGIN_ATTEMPT_LIMIT
        ) {
          //Make User as Suspended
          await this.membersService.updateSuspendedOn(member.id, new Date());
          throw new HttpException(
            {
              status: HttpStatus.FORBIDDEN,
              errors: {
                email: `You have exceeded your maximum allowed sign-in attempts. As a security precaution, we have suspended your account for ${userSuspendConstants.SM_ACCONT_SUSPENSION_LENGTH} hours. Please contact support@stallionmatch.com for assistance`,
              },
            },
            HttpStatus.FORBIDDEN,
          );
        } else {
          //Update Failed Login Count
          await this.membersService.updateFailedLoginCount(
            member.id,
            failedLoginAttempts,
          );
        }
      }
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            password: 'Incorrect Password',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  /* Accept Farm Invitation */
  async acceptFarmInvitation(invitationDto: AcceptFarmInvitationDto) {
    const user = this.request.user;
    const member = await this.membersService.findOneById(user['id']);

    if (invitationDto?.invitationKey) {
      const invitation = await this.memberInvitationsService.findOne({
        hash: invitationDto?.invitationKey,
      });
      if (!invitation) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              hashKey: `Invitation not found!`,
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      } else {
        if (
          !invitation.isAccepted &&
          (await this.commonUtilsService.getUTCTimestampInSeconds(
            invitation.expiredOn,
          )) <
            (await this.commonUtilsService.getUTCTimestampInSeconds(new Date()))
        ) {
          throw new HttpException(
            {
              status: HttpStatus.GONE,
              errors: {
                hashKey: `Invitation link expired!`,
              },
            },
            HttpStatus.GONE,
          );
        }
      }
      //If Invitation Email and LoggedIn Member email not same return with error
      if (invitation.email !== member.email) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              hashKey: `Invitation email and login email not matched!`,
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      //If invitation not accepted
      if (!invitation.isAccepted) {
        /* Creating a new record in MemberFarm */
        let farmAccessLevel = await this.farmAccessLevelsService.findOne(
          invitation.accessLevelId,
        );
        let farmMember = new CreateFarmMemberDto();
        farmMember.farmId = invitation.farmId;
        farmMember.memberId = member.id;
        farmMember.accessLevelId = invitation.accessLevelId;
        farmMember.RoleId = farmAccessLevel.roleId;
        farmMember.isFamOwner = false;
        farmMember.createdBy = invitation.createdBy;
        let memberFarmRecord = await this.memberFarmsService.create(farmMember);
        // invitation.accessLevelId - 3 For ThirdParty Access
        if (invitation.accessLevelId === AccessLevel.thirdparty) {
          await this.memberFarmStallionsService.setStallions(
            invitation,
            memberFarmRecord,
          );
        }
        invitation.isAccepted = true;
        invitation.memberId = member.id;
        await invitation.save();
      }
    }
    if (!member || (member && ![RoleEnum.breeder].includes(member.roleId))) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'User not exists!',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (member.provider !== AuthProvidersEnum.email) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: `needLoginViaProvider:${member.provider}`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    let myObj = { myFarms: null, stallionShortlistCount: 0 };
    const stallionShortlist =
      await this.StallionShortlistService.getSSCountByMemberId(member.id);
    myObj.stallionShortlistCount = stallionShortlist;
    let memberData = {
      id: member.memberuuid,
      email: member.email,
      fullName: member.fullName,
      roleId: member.roleId,
      status: member.status,
      provider: member.provider,
      memberaddress: member.memberaddress,
    };

    const farms = await this.memberFarmsService.getMemberFarmsByMemberId({
      memberId: member.id,
    });
    await this.membersService.updateLastActive(member.id);
    if (farms.length > 0) {
      myObj.myFarms = farms;
    }
    return { ...myObj, member: memberData };
  }

  /* Register Breeder User */
  async registerBreeder(dto: AuthRegisterBreederDto): Promise<void> {
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const member = await this.membersService.create({
      ...dto,
      email: dto.email,
      roleId: RoleEnum.breeder,
      status: {
        id: StatusEnum.registered,
      } as Status,
      hash,
    });

    this.setAllPreferedNotifications(member.id);

    this.mailService.memberSignUp({
      to: member.email,
      data: {
        hash,
        fullName: dto.fullName,
      },
    });
    this.mailService.sendMailCommon({
      to: member.email,
      subject: await this.i18n.t('common.signUpBreederSuccess'),
      text: '',
      template: '/breeder-signup',
      context: {},
    });
  }

  /* Register Farm Admin */
  async registerFarmAdmin(dto: AuthRegisterFarmownerDto): Promise<void> {
    const { farmName, farmCountryId, farmStateId, farmWebsiteUrl } = dto;
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const member = await this.membersService.create({
      ...dto,
      email: dto.email,
      roleId: RoleEnum.breeder,
      status: {
        id: StatusEnum.registered,
      } as Status,
      hash,
    });

    this.setAllPreferedNotifications(member.id);

    // Set CreatedBy Id after successful member creation
    // Add Farm Data
    let farmData = new CreateFarmDto();
    farmData.farmName = farmName;
    farmData.website = farmWebsiteUrl;
    farmData.countryId = farmCountryId;
    farmData.stateId = farmStateId;
    farmData.createdBy = member.id;
    await this.farmsService.create(farmData);

    this.mailService.memberSignUp({
      to: member.email,
      data: {
        hash,
        fullName: dto.fullName,
      },
    });
  }

  /* Resend Confirmation Link */
  async resendConfirmEmail() {
    const member = this.request.user;
    const record = await this.membersService.findOneById(member['id']);

    if (!record) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `User not exist!`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');
    record.hash = hash;
    await record.save();
    await this.mailService.memberSignUp({
      to: record.email,
      data: {
        hash,
        fullName: record.fullName,
      },
    });
    return { message: 'Verification link has been sent successfully' };
  }

  /* Confirm Email Address */
  async confirmEmail(hash: string): Promise<void> {
    const member = await this.membersService.findMemberByHash(hash);
    if (!member) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `User not exist!`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    member.hash = null;
    member.status = plainToClass(Status, {
      id: StatusEnum.active,
    });
    member.isVerified = true;
    await member.save();
  }

  /* Forgot Password */
  async forgotPassword(email: string): Promise<void> {
    const member = await this.membersService.findOne({
      email: email,
      roleId: In([RoleEnum.breeder]),
    });

    if (!member) {
      throw new NotFoundException('Email not exists!');
    } else {
      if (member.provider === AuthProvidersEnum.google) {
        throw new NotFoundException(
          `${member.email} is registered Via ${member.provider}. You cann't change password, Please try with ${member.provider} Login`,
        );
      }
      const hash = crypto
        .createHash('sha256')
        .update(randomStringGenerator())
        .digest('hex');
      await this.forgotService.create({
        hash,
        member,
      });

      this.mailService.forgotPassword({
        to: email,
        data: {
          hash,
          fullName: member.fullName,
        },
      });
    }
  }

  /* Reset Password */
  async resetPassword(hash: string, password: string) {
    const forgot = await this.forgotService.findOne({
      where: {
        hash,
      },
    });
    if (!forgot) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: `Record not exist!`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    } else {
      if (
        (await this.commonUtilsService.getUTCTimestampInSeconds(
          forgot.expiredOn,
        )) <
        (await this.commonUtilsService.getUTCTimestampInSeconds(new Date()))
      ) {
        throw new HttpException(
          {
            status: HttpStatus.GONE,
            errors: {
              hash: `link expired`,
            },
          },
          HttpStatus.GONE,
        );
      }
    }

    const member = forgot.member;
    member.password = password;
    await member.save();
    await this.forgotService.softDelete(forgot.id);
  }

  /* Resend forogt password link */
  async resendForgotPasswordLink(hash: string): Promise<void> {
    const forgot = await this.forgotService.findOne({
      where: {
        hash,
      },
    });
    if (!forgot) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: `Not Found!`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const member = forgot.member;
    await this.forgotPassword(member.email);
    await this.forgotService.softDelete(forgot.id);
  }

  async me(member: Member) {
    return this.membersService.findOneWithMinimalInfo({
      id: member.id,
    });
  }

  /* Update Password */
  async updatePassword(member: Member, memberDto: AuthUpdateDto) {
    await this.membersService.update(member, memberDto);
    const template = '/password-changed-success';

    this.sendNotificationMail(
      member,
      notificationTemplates.passwordChangedConfirmation,
      notificationType.MEMBERSHIP_UPDATES,
      template,
    );
    return this.membersService.findOneWithMinimalInfo({
      id: member.id,
    });
  }

  /* Send Notification Mail */
  async sendNotificationMail(
    member: Member,
    messageTemplateUuid: string,
    notificationTypeCode: string,
    template: string,
  ) {
    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        messageTemplateUuid,
      );
    const messageText = messageTemplate.messageText;
    const messageTitle = messageTemplate.messageTitle;

    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationTypeCode,
        member['id'],
      );

    this.notificationsService.create({
      createdBy: member['id'],
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: member['id'],
      messageTitle,
      messageText,
      isRead: false,
      notificationType: preferedNotification?.notificationTypeId,
    });
    if (messageTemplate) {
      if (messageTemplate.emailSms) {
        const recipient = await getRepository(Member).findOne({
          id: member['id'],
        });

        if (!preferedNotification || preferedNotification.isActive) {
          let mailData = {
            to: recipient.email,
            subject: messageTitle,
            text: '',
            template: template,
            context: {
              userName: await this.commonUtilsService.toTitleCase(
                recipient.fullName,
              ),
            },
          };

          this.mailService.sendMailCommon(mailData);
        }
      }
    }
  }

  /* Update User Address */
  async updateMemberAddress(
    member: Member,
    updateAddressDto: UpdateAddressDto,
  ) {
    const record = await this.memberAddressService.findMemberAddress(
      member.id,
    );
    const country = await this.countryService.findByCountryId(
      updateAddressDto.countryId,
    );
    if (!country) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            message: 'Country not Found',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const updateData = {
      countryId: country['countryId'],
      postcode:updateAddressDto.postcode,
      address: updateAddressDto.address,
    };
    await this.eventEmitter.emitAsync('updateUserAddress', {
      originalData: this.request,
      countryId: record['countryId'],
      address:record['address']
    });
  
    await this.memberAddressService.create(member, updateData);

    return this.membersService.findOneWithMinimalInfo({
      id: member.id,
    });
  }

  /* User Soft Delete */
  async softDelete(member: Member): Promise<void> {
    await this.membersService.softDelete(member.id);
  }

  /* Get User By Refresh Token */
  async getUserIfRefreshTokenMatches(refreshToken: string) {
    try {
      const decoded = this.jwtService.decode(refreshToken) as JwtPayload;
      if (!decoded) {
        throw new Error();
      }
      const user = await this.membersService.getUserByEmail(decoded.email);
      const isRefreshTokenMatching = await bcrypt.compare(
        refreshToken,
        user.hashedRefreshToken,
      );
      if (isRefreshTokenMatching) {
        await this.membersService.removeRefreshToken(user.email);
        return user;
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  /* Get User Access Token */
  async getAccessToken(payload: JwtPayload) {
    const accessToken = await this.jwtService.sign(payload, {
      secret: this.configService.get('auth.secret'),
      expiresIn: this.configService.get('auth.expires'),
    });
    return accessToken;
  }

  /* Get User Refresh Token */
  async getRefreshToken(payload: JwtPayload) {
    const refreshToken = await this.jwtService.sign(payload, {
      secret: this.configService.get('auth.refreshTokenSecret'),
      expiresIn: this.configService.get('auth.refreshTokenExpires'),
    });
    return refreshToken;
  }

  /* Get New Access And Refresh Tokens for User */
  async getNewAccessAndRefreshToken(payload: JwtPayload) {
    const refreshToken = await this.getRefreshToken(payload);
    await this.membersService.setCurrentRefreshToken(payload.id, refreshToken);

    return {
      accessToken: await this.getAccessToken(payload),
      refreshToken: refreshToken,
    };
  }

  /* User Refresh Tokens */
  async refreshTokens(
    token: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    const user = await this.getUserIfRefreshTokenMatches(token.refresh_token);
    if (user) {
      const userInfo = {
        id: user.id,
        roleId: user.roleId,
        email: user.email,
      };
      return this.getNewAccessAndRefreshToken(userInfo);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `Not Found!`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /* Get Farms Assosiated with User */
  async getMemberFarms() {
    this.memberFarmsService.getMemberFarms();
  }

  /* Validate Reset Password Link */
  async validateResetPasswordLink(
    hash: string,
  ): Promise<ResetPasswordLinkResponseDto> {
    const forgot = await this.forgotService.findOne({
      where: {
        hash,
      },
    });
    if (!forgot) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: `Not Found!`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    } else {
      if (
        (await this.commonUtilsService.getUTCTimestampInSeconds(
          forgot.expiredOn,
        )) <
        (await this.commonUtilsService.getUTCTimestampInSeconds(new Date()))
      ) {
        throw new HttpException(
          {
            status: HttpStatus.GONE,
            errors: {
              hash: `Link Expired!`,
            },
          },
          HttpStatus.GONE,
        );
      }
    }

    const member = forgot.member;
    let data = {
      fullName: member.fullName,
      email: member.email,
    };
    return data;
  }

  /* Register Farm User */
  async registerFarmUser(dto: AuthRegisterFarmmemberDto): Promise<void> {
    const invitation = await this.memberInvitationsService.findOne({
      hash: dto.hashKey,
      isAccepted: false,
    });
    if (!invitation) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hashKey: `Not Found!`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    } else {
      if (
        (await this.commonUtilsService.getUTCTimestampInSeconds(
          invitation.expiredOn,
        )) <
        (await this.commonUtilsService.getUTCTimestampInSeconds(new Date()))
      ) {
        throw new HttpException(
          {
            status: HttpStatus.GONE,
            errors: {
              hashKey: `Link Expired!`,
            },
          },
          HttpStatus.GONE,
        );
      }
    }
    const memberRecord = await this.membersService.findOne({
      email: invitation.email,
    });
    if (memberRecord) {
      throw new ConflictException('Member already exist!');
    }
    const hashString = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');
    const member = await this.membersService.create({
      ...dto,
      email: invitation.email,
      fullName: invitation.fullName,
      roleId: RoleEnum.breeder,
      status: {
        id: StatusEnum.registered,
      } as Status,
      hash: hashString,
    });

    /* Creating a new record in MemberFarm */
    //ALLOW ONLY FOR FARMACCESS
    this.setAllPreferedNotifications(member.id);

    if (invitation.farmId && invitation.accessLevelId) {
      let farmAccessLevel = await this.farmAccessLevelsService.findOne(
        invitation.accessLevelId,
      );
      let farmMember = new CreateFarmMemberDto();
      farmMember.farmId = invitation.farmId;
      farmMember.memberId = member.id;
      farmMember.accessLevelId = invitation.accessLevelId;
      farmMember.RoleId = farmAccessLevel.roleId;
      farmMember.isFamOwner = false;
      farmMember.createdBy = invitation.createdBy;
      let memberFarmRecord = await this.memberFarmsService.create(farmMember);
      // invitation.accessLevelId - 3 For ThirdParty Access
      if (invitation.accessLevelId === AccessLevel.thirdparty) {
        await this.memberFarmStallionsService.setStallions(
          invitation,
          memberFarmRecord,
        );
      }
    }
    invitation.isAccepted = true;
    invitation.memberId = member.id;
    await invitation.save();

    if (
      invitation.farmId &&
      invitation.accessLevelId === AccessLevel.fullaccess
    ) {
      const farm = await this.farmsService.findOne({ id: invitation.farmId });
      const messageTemplate =
        await this.messageTemplatesService.getMessageTemplateByUuid(
          notificationTemplates.farmMemberTypeRequest,
        );
      let messageText = messageTemplate.messageText
        .replace(
          '{FarmAdminUser}',
          await this.commonUtilsService.toTitleCase(member.fullName),
        )
        .replace(
          '{FarmName}',
          await this.commonUtilsService.toTitleCase(farm.farmName),
        );
      let messageTitle = messageTemplate.messageTitle;

      const preferedNotification =
        await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
          notificationType.SYSTEM_NOTIFICATIONS,
          member['id'],
        );

      await this.notificationsService.create({
        createdBy: member['id'],
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: member['id'],
        messageTitle,
        messageText,
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
      });

      if (
        preferedNotification &&
        preferedNotification.isActive
      ) {
        let mailData = {
          to: member.email,
          subject: 'Welcome New Admin',
          text: '',
          template: '/farm-new-admin',
          context: {
            farmAdminUser: await this.commonUtilsService.toTitleCase(
              member.fullName,
            ),
            farmName: await this.commonUtilsService.toTitleCase(farm.farmName),
            manageUsers:
              process.env.FRONTEND_DOMAIN +
              '/' +
              process.env.FRONTEND_APP_DASHBOARD_URI +
              farm.farmName +
              '/' +
              farm.farmUuid,
            manageAccount: process.env.FRONTEND_DOMAIN + '/user/profile',
          },
        };

        this.mailService.sendMailCommon(mailData);
      }
    } else {
      await this.mailService.memberSignUp({
        to: member.email,
        data: {
          hash: hashString,
          fullName: invitation.fullName,
        },
      });
    }
  }

  /* Get User By Email */
  async getUserByEmail(emailData: EmailExistDto) {
    let record = await this.membersService.getUserByEmail(emailData.email);
    if (record) {
      const preferedNotification =
        await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
          notificationType.SYSTEM_NOTIFICATIONS,
          record['id'],
        );

      if (!preferedNotification || preferedNotification.isActive) {
        let mailData = {
          to: record.email,
          subject: 'Email Already Exists',
          text: '',
          template: '/email-already-exists',
          context: {
            userName: record.fullName,
          },
        };

        this.mailService.sendMailCommon(mailData);
      }
      throw new ConflictException('Email already exists');
    } else {
      return { message: 'Your email is valid!' };
    }
  }

  /*For validating staging basic login - Ignore it for Production*/
  async basicHttpAuthorize(authDto: AuthDto) {
    const { secret } = authDto;
    if (secret !== process.env.APP_SECRET) {
      throw new UnauthorizedException('Unauthorized!');
    }
    return { message: 'Valid!' };
  }

  /* Set All PreferedNotifications For a User */
  setAllPreferedNotifications(memberId: number) {
    const preferedNotification =
      this.preferedNotificationService.setAllPreferedNotifications(memberId);
  }

  /* Accept Invitation */
  async acceptInvitation(authConfirmEmailDto: AuthConfirmEmailDto) {
    const member = this.request.user;
    if (authConfirmEmailDto.hash) {
      const invitation = await this.memberInvitationsService.findOne({
        hash: authConfirmEmailDto.hash,
      });
      if (!invitation) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              hashKey: `Invitation not found!`,
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      } else {
        if (
          !invitation.isAccepted &&
          (await this.commonUtilsService.getUTCTimestampInSeconds(
            invitation.expiredOn,
          )) <
            (await this.commonUtilsService.getUTCTimestampInSeconds(new Date()))
        ) {
          throw new HttpException(
            {
              status: HttpStatus.GONE,
              errors: {
                hashKey: `link expired`,
              },
            },
            HttpStatus.GONE,
          );
        }
      }
      //If Invitation Email and LoggedIn Member email not same return with error
      if (invitation.email !== member['email']) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              hashKey: `Inviation email and login email not matched!`,
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      //If invitation not accepted
      if (!invitation.isAccepted) {
        /* Creating a new record in MemberFarm */
        let farmAccessLevel = await this.farmAccessLevelsService.findOne(
          invitation.accessLevelId,
        );
        let farmMember = new CreateFarmMemberDto();
        farmMember.farmId = invitation.farmId;
        farmMember.memberId = member['id'];
        farmMember.accessLevelId = invitation.accessLevelId;
        farmMember.RoleId = farmAccessLevel.roleId;
        farmMember.isFamOwner = false;
        farmMember.createdBy = invitation.createdBy;
        let memberFarmRecord = await this.memberFarmsService.create(farmMember);
        // invitation.accessLevelId - 3 For ThirdParty Access
        if (invitation.accessLevelId === AccessLevel.thirdparty) {
          await this.memberFarmStallionsService.setStallions(
            invitation,
            memberFarmRecord,
          );
        }
        const accept = await this.memberInvitationsService.updateInvitaion(
          { id: invitation.id },
          { isAccepted: true, memberId: member['id'] },
        );

        if (invitation.accessLevelId === AccessLevel.fullaccess) {
          const preferedNotification =
            await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
              notificationType.SYSTEM_NOTIFICATIONS,
              member['id'],
            );
          if (preferedNotification && preferedNotification.isActive) {
            const recipient = await getRepository(Member).findOne({
              id: member['id'],
            });
            const farm = await this.farmsService.findOne({
              id: invitation.farmId,
            });
            let farmName = farm.farmName;
            let farmUuid = farm.farmUuid;
            let mailData = {
              to: recipient.email,
              subject: 'Welcome New Admin',
              text: '',
              template: '/farm-new-admin',
              context: {
                farmAdminUser: await this.commonUtilsService.toTitleCase(
                  recipient.fullName,
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
                  process.env.FRONTEND_DOMAIN + '/' + farmName + '/' + farmUuid,
              },
            };

            this.mailService.sendMailCommon(mailData);
          }
        }
        return { message: 'Updated Successfully' };
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hashKey: `Invitation not found!`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  /* Get Invitation Hash By Email */
  async getHash() {
    const member = this.request.user;
    const invitation = await this.memberInvitationsService.findHash({
      email: member['email'],
    });
    if (invitation) {
      return invitation;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hashKey: `Invitation not found`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  /* Get User Data by Confirm Hash */
  async getMemberDataByConfirmHash(hash: string) {
    const member = await this.membersService.findMemberByHash(hash);
    if (!member) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `User not exist!`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      email: member.email,
    };
  }

  /* Verify Token */
  async verifyToken(token) {
    return this.jwtService.decode(token) as JwtPayload;
  }

  /* Google Login */
  async googleWithLogin(
    loginDto: AuthGoogleLoginDto,
  ): Promise<AuthLoginResponseDto> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${loginDto.token}`,
        {
          headers: {
            Authorization: `Bearer ${loginDto.token}`,
            Accept: 'application/json',
          },
        },
      );
      if (!response) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              email: 'User not exist!',
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      const { name, email, verified_email, id, postcode } = response.data;
      // return response.data;
      //   const data = await googlClient.verifyIdToken({
      //     audience: process.env.CLIENT_ID,
      //     idToken: loginDto.token,
      //   });
      //   const { name, email, email_verified, sub} = data.getPayload();
      let member = await this.membersService.findOne({ email: email });
      if (member) {
        if (member.provider === AuthProvidersEnum.email) {
          throw new HttpException(
            {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: {
                email: `${member.email} is registered Via ${member.provider}. Please try with ${member.provider} Login`,
              },
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
        if (member.provider === AuthProvidersEnum.google) {
          const userSuspendConstants = await this.settingService.getData();
          let currentDateTime = new Date();
          let suspensionDateTime = new Date(member.suspendedOn);
          suspensionDateTime.setHours(
            suspensionDateTime.getHours() +
              userSuspendConstants.SM_ACCONT_SUSPENSION_LENGTH,
          );
          if (member.status.id === StatusEnum.suspended) {
            //Suspension from portal - part of wrong login related suspension
            if (
              currentDateTime <= suspensionDateTime &&
              member.suspendedOn != null
            ) {
              throw new HttpException(
                {
                  status: HttpStatus.FORBIDDEN,
                  errors: {
                    email: `You have exceeded your maximum allowed sign-in attempts. As a security precaution, we have suspended your account for ${userSuspendConstants.SM_ACCONT_SUSPENSION_LENGTH} hours. Please contact support@stallionmatch.com for assistance`,
                  },
                },
                HttpStatus.FORBIDDEN,
              );
            }
            //Suspension From - Admin
            if (member.suspendedOn === null) {
              throw new HttpException(
                {
                  status: HttpStatus.FORBIDDEN,
                  errors: {
                    email: `Your account has suspended, Please contact support@stallionmatch.com for assistance`,
                  },
                },
                HttpStatus.FORBIDDEN,
              );
            }
            /* Reset Failed Login Count to 0 - If a Successful Login After Failed Login! */
            await this.membersService.updateFailedLoginCount(member.id, 0);
            await this.membersService.updateSuspendedOn(member.id, null);
          }
          /* Reset Failed Login Count to 0 - If a Successful Login After Failed Login! */
          if (
            member.failedLoginAttempts <=
            userSuspendConstants.SM_PORTAL_LOGIN_ATTEMPT_LIMIT
          ) {
            await this.membersService.updateFailedLoginCount(member.id, 0);
            await this.membersService.updateSuspendedOn(member.id, null);
          }
          if (member.status.id === StatusEnum.closed) {
            throw new HttpException(
              {
                status: HttpStatus.FORBIDDEN,
                errors: {
                  email: `Your account is closed, please contact Support!`,
                },
              },
              HttpStatus.FORBIDDEN,
            );
          }
          if (!member.isVerified) {
            const messageTemplate =
              await this.messageTemplatesService.getMessageTemplateByUuid(
                notificationTemplates.pleaseConfirmYourAccount,
              );
            const messageText = messageTemplate.messageText;
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
              recipientId: member['id'],
              messageTitle,
              messageText,
              isRead: false,
              notificationType: preferedNotification?.notificationTypeId,
            });
          }
        }
      } else {
        let newData = {
          fullName: name,
          email: email,
          provider: 'google',
          socialId: id,
          countryId: DEFAULT_VALUES.COUNTRY,
          isVerified: verified_email,
          password: '',
          roleId: RoleEnum.breeder,
          status: {
            id: StatusEnum.active,
          } as Status,
          lastActive: new Date(),
          postcode:postcode
        };

        if (!verified_email) {
          const hash = crypto
            .createHash('sha256')
            .update(randomStringGenerator())
            .digest('hex');

          newData['hash'] = hash;

          this.mailService.memberSignUp({
            to: member.email,
            data: {
              hash,
              fullName: newData.fullName,
            },
          });
        }

        let newMember = await this.membersService.create(newData);
        member = await this.membersService.findOne({ id: newMember.id });

        this.setAllPreferedNotifications(member.id);
        this.mailService.sendMailCommon({
          to: email,
          subject: await this.i18n.t('common.signUpBreederSuccess'),
          text: '',
          template: '/breeder-signup',
          context: {},
        });
      }

      const tokenData = await this.getNewAccessAndRefreshToken({
        id: member.id,
        roleId: member.roleId,
        email: member.email,
      });

      let myObj = { myFarms: null, stallionShortlistCount: 0 };
      const stallionShortlist =
        await this.StallionShortlistService.getSSCountByMemberId(member.id);
      myObj.stallionShortlistCount = stallionShortlist;
      let memberData = {
        id: member.memberuuid,
        email: member.email,
        fullName: member.fullName,
        roleId: member.roleId,
        status: member.status,
        provider: member.provider,
        memberaddress: member.memberaddress,
      };

      const farms = await this.memberFarmsService.getMemberFarmsByMemberId({
        memberId: member.id,
      });
      await this.membersService.updateLastActive(member.id);
      if (farms.length > 0) {
        myObj.myFarms = farms;
      }
      return { ...tokenData, ...myObj, member: memberData };
    } catch (error) {
      console.log('=============error in google login', error);
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: error.response.errors.email,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
