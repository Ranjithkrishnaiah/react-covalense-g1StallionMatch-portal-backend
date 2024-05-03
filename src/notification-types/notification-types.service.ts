import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTypesResponse } from './dto/notification-types-response';
import { NotificationType } from './entities/notification-type.entity';

@Injectable()
export class NotificationTypesService {
  constructor(
    @InjectRepository(NotificationType)
    private notificationTypeRepository: Repository<NotificationType>,
  ) {}

  /* Get all notification types */
  findAll(): Promise<NotificationTypesResponse[]> {
    return this.notificationTypeRepository.find();
  }

  /* Get notification types by code */
  findByNotificationCode(notificationTypeCode:string): Promise<NotificationTypesResponse> {
    return this.notificationTypeRepository.findOne({notificationTypeCode});
  }
}
