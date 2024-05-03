import {
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { Repository } from 'typeorm';
import { FarmLocationDto } from './dto/farm-location.dto';
import { FarmLocation } from './entities/farm-location.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import {
  notificationTemplates,
  notificationType,
} from 'src/utils/constants/notifications';
import { PreferedNotificationService } from 'src/prefered-notifications/prefered-notifications.service';

@Injectable({ scope: Scope.REQUEST })
export class FarmLocationsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FarmLocation)
    private farmLocationRepository: Repository<FarmLocation>,
    private messageTemplatesService: MessageTemplatesService,
    private notificationsService: NotificationsService,
    private preferedNotificationService: PreferedNotificationService,
  ) {}
  /* Save Farm Location Information */
  async create(farmLocationDto: FarmLocationDto) {
    return this.farmLocationRepository.save(
      this.farmLocationRepository.create(farmLocationDto),
    );
  }
  /* Update Farm Location Information */
  async update(id: number, farmLocationDto: FarmLocationDto) {
    // notification
    let record = await this.findByFarmId(id);
    let recordData = {
      countryId: record.countryId,
      stateId: record.stateId,
      farmId: record.farmId,
      address: record.address,
      postcode: record.postcode,
    };
    if (JSON.stringify(recordData) != JSON.stringify(farmLocationDto)) {
      const preferedNotification =
        await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
          notificationType.SYSTEM_NOTIFICATIONS,
        );

      const messageTemplate =
        await this.messageTemplatesService.getMessageTemplateByUuid(
          notificationTemplates.updateMissingInformationProfile,
        );
      const messageText = messageTemplate.messageText;
      const messageTitle = messageTemplate.messageTitle;
      const member = this.request.user;
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

    return this.farmLocationRepository.update({ farmId: id }, farmLocationDto);
  }
  /* Get Farm Location Information By FarmId */
  async findByFarmId(farmId: number) {
    const record = await this.farmLocationRepository.findOne({ farmId });
    if (!record) {
      throw new UnprocessableEntityException('Farm location not exist!');
    }
    return record;
  }
}
