import { Inject, Injectable, Scope, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { StallionRequest } from './entities/stallion-request.entity';
import { CreateStallionRequestDto } from './dto/create-stallion-request.dto';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { MembersService } from 'src/members/members.service';
import { CountryService } from 'src/country/service/country.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { notificationTemplates, notificationType } from 'src/utils/constants/notifications';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { NotificationTypesService } from 'src/notification-types/notification-types.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable({ scope: Scope.REQUEST })
export class StallionRequestsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(StallionRequest)
    private stallionRequestRepository: Repository<StallionRequest>,
    readonly mailService: MailService,
    readonly configService: ConfigService,
    readonly commonUtilsService: CommonUtilsService,
    readonly membersService: MembersService,
    readonly countryService: CountryService,
    readonly notificationsService: NotificationsService,
    readonly messageTemplatesService: MessageTemplatesService,
    readonly notificationTypesService: NotificationTypesService,
    private eventEmitter: EventEmitter2,
    ) {}

  /* Capture the a new stallion request */
  async create(createStallionRequest: CreateStallionRequestDto) {
    const member = this.request.user;
    createStallionRequest.isApproved = false;
    createStallionRequest.createdBy = member['id'];
    try{
      const response = await this.stallionRequestRepository.save(
        this.stallionRequestRepository.create(createStallionRequest),
      );

      const supperAdmin =  await this.membersService.getSupperAdmin();
      if(supperAdmin){
        this.request['requestId'] = response.stallionRequestUuid;
        this.eventEmitter.emitAsync('stallionRequest', { originalData: this.request});
        const user = await this.membersService.findOne({id:member['id']});

        const messageTemplate =
        await this.messageTemplatesService.getMessageTemplateByUuid(
          notificationTemplates.requestForNewHorse,
        );
        const userName = await this.commonUtilsService.toTitleCase(user?.fullName)
        const country = await this.countryService.getCountryById(createStallionRequest.countryId);
        const messageText = messageTemplate.messageText.replace('{userName}', await this.commonUtilsService.toTitleCase(userName)).replace('{horseName}', await this.commonUtilsService.toTitleCase(createStallionRequest.horseName));
        const messageTitle = messageTemplate.messageTitle;
        const actionUrl = messageTemplate.linkAction.replace('{requestId}', response.stallionRequestUuid);
        const notificationTypes =
          await this.notificationTypesService.findByNotificationCode(notificationType.SYSTEM_NOTIFICATIONS);

        this.notificationsService.create({
          createdBy: member['id'],
          messageTemplateId: messageTemplate?.id,
          notificationShortUrl: 'notificationShortUrl',
          recipientId: supperAdmin['id'],
          messageTitle,
          messageText,
          isRead: false,
          notificationType: notificationTypes?.id,
          actionUrl,
        });

        let horseRouteLink = `${
          this.configService.get('file.systemActivityAdminDomain')
        }${actionUrl.replace('/dashboard','')}`;

        let location = '';
        if(createStallionRequest?.countryName){
          location = createStallionRequest?.countryName;
        }else if(user?.memberaddress.length){
          let memberAddress = user.memberaddress[0];
          location = memberAddress['countryName'];
        }
        this.mailService.sendMailCommon({
          to: supperAdmin.email,
          subject: 'Add Horse Request',
          text: '',
          template: '/add-horse-request-new',
          context:{
            userName: user?.fullName,
            adminName: supperAdmin?.fullName,
            horseName: createStallionRequest.horseName,
            yob: createStallionRequest.yob,
            cob: country?.countryName,
            locationAddHorseWasClicked: location,
            horseRouteLink: horseRouteLink,
            messageUrl:`${this.configService.get('file.systemActivityAdminDomain')}/data/${user?.fullName}/nameFilter`
          }
        })
      }
      return response;
    }catch(err){
      throw new UnprocessableEntityException(err);
    }
  }
}
