import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import * as requestIp from 'request-ip';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { ContactusDto } from './dto/contactus.dto';
import { Contactus } from './entities/contactus.entity';
import { MembersService } from 'src/members/members.service';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { notificationTemplates, notificationType } from 'src/utils/constants/notifications';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { PreferedNotificationService } from 'src/prefered-notifications/prefered-notifications.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable({ scope: Scope.REQUEST })
export class ContactusService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Contactus)
    private contactusRepository: Repository<Contactus>,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
    private mailService: MailService,
    private membersService: MembersService,
    private messageTemplatesService: MessageTemplatesService,
    private preferedNotificationService: PreferedNotificationService,
    private notificationsService: NotificationsService,
    private readonly commonUtilsService: CommonUtilsService,
  ) {}

  /* Capture Contact Us Info */
  async create(contactusDto: ContactusDto) {
    const ipAddress = requestIp.getClientIp(this.request);
    let interestedIn = contactusDto.interestedIn;
    let insertData = {
      interestedIn: interestedIn.join('|'),
      contactName: contactusDto.contactName,
      contactEmail: contactusDto.contactEmail,
      contactDescription: contactusDto.contactDescription,
      userAgent: this.request.headers['user-agent'],
      ipAddress: ipAddress,
      countryName: contactusDto.countryName,
    };
    let record = await this.contactusRepository.save(
      this.contactusRepository.create(insertData),
    );
    if (!record) {
      throw new InternalServerErrorException('Internal server exception!');
    }
    let contactRecord = await this.contactusRepository.manager.query(
      `EXEC procGetContactUsRecordById 
      @contactUsId=@0`,
      [record.id],
    );
    if (contactRecord.length === 0) {
      throw new InternalServerErrorException('Internal server exception!');
    }
    const userName = contactRecord[0].userName;
    const userEmail = contactRecord[0].userEmail;
    const userInterestedIn = contactRecord[0].interestedIn;
    const description = contactRecord[0].description;
    let location = '';
    if (contactRecord[0].stateName) {
      location = `${contactRecord[0].stateName}, `;
    }
    if (contactRecord[0].countryName) {
      location = `${location}${contactRecord[0].countryName}`;
    }
    const supperAdmin = await this.membersService.getSupperAdmin();
    if (supperAdmin) {
      const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        notificationTemplates.completedTheContactForm,
      );
      let messageText = messageTemplate.messageText.replace(
        '{UserName}',
        await this.commonUtilsService.toTitleCase(userName),
      );
      const messageTitle = messageTemplate.messageTitle;
      const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
      );

      this.notificationsService.create({
        createdBy: null,
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: supperAdmin.id,
        messageTitle,
        messageText,
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
        farmid: null
      });
      await this.eventEmitter.emitAsync('completedTheContactForm', {
        originalData: this.request,
      });
      this.mailService.contactUsInfoToSupport({
        to: supperAdmin.email,
        data: {
          userName: userName,
          userEmail: userEmail,
          userInterestedIn: userInterestedIn,
          description: description,
          location: location,
        },
      });
    }
    this.mailService.contactUs({
      to: record.contactEmail,
      data: {
        fullName: record.contactName,
      },
    });
  }
}
