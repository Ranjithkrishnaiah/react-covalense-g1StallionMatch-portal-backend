import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PreferedNotification } from './entities/prefered-notification.entity';
import { CreatePreferedNotificationDto } from './dto/create-prefered-notification.dto';
import { PreferedNotificationResponseDto } from './dto/prefered-notification-response.dto';
import { NotificationType } from 'src/notification-types/entities/notification-type.entity';

@Injectable({ scope: Scope.REQUEST })
export class PreferedNotificationService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(PreferedNotification)
    private preferedNotificationRepository: Repository<PreferedNotification>,
  ) {}

  /* Create a Record */
  async create(createPreferedNotificationDto: CreatePreferedNotificationDto) {
    const member = this.request.user;
    createPreferedNotificationDto.createdBy = member['id'];
    createPreferedNotificationDto.memberId = member['id'];
    const record = await this.preferedNotificationRepository.findOne({
      memberId: createPreferedNotificationDto.memberId,
      notificationTypeId: createPreferedNotificationDto.notificationTypeId,
    });
    if (record) {
      record.isActive = createPreferedNotificationDto.isActive;
      record.modifiedBy = member['id'];
      record.modifiedOn = new Date();
      await record.save();
      return record;
    }
    const response = await this.preferedNotificationRepository.save(
      this.preferedNotificationRepository.create(createPreferedNotificationDto),
    );
    return response;
  }

  /* Get all records */
  async getAll(): Promise<PreferedNotificationResponseDto[]> {
    const member = this.request.user;
    let queryBuilder = this.preferedNotificationRepository
      .createQueryBuilder('preferednotification')
      .select(
        'preferednotification.notificationTypeId as notificationTypeId, preferednotification.isActive as isActive',
      )
      .addSelect(
        'notificationtype.notificationTypeName as notificationTypeName',
      )
      .innerJoin('preferednotification.notificationtype', 'notificationtype')
      .andWhere('preferednotification.memberId = :memberId', {
        memberId: member['id'],
      })
      .orderBy('preferednotification.createdOn', 'ASC');

    const entities = await queryBuilder.getRawMany();

    let prefnNotificationTypeId = [];
    for (const item of entities) {
      prefnNotificationTypeId.push(item['notificationTypeId']);
    }

    let typeBuilder = getRepository(NotificationType)
      .createQueryBuilder('notificationType')
      .select(
        'notificationType.id as notificationTypeId, notificationType.notificationTypeName as notificationTypeName',
      );

    const ntfnType = await typeBuilder.getRawMany();

    for (const item of ntfnType) {
      if (!prefnNotificationTypeId.includes(item['notificationTypeId'])) {
        entities.push({
          notificationTypeId: item['notificationTypeId'],
          isActive: false,
          notificationTypeName: item['notificationTypeName'],
        });
      }
    }

    return entities;
  }

  /* Set all prefered notifications to a member */
  async setAllPreferedNotifications(memberId: number) {
    let queryBuilder = getRepository(NotificationType)
      .createQueryBuilder('notificationType')
      .select('notificationType.id as notificationTypeId');

    const entities = await queryBuilder.getRawMany();

    let preferedNotifications = [];
    if (entities && entities.length) {
      entities.forEach(async (element) => {
        let createPreferedNotificationDto = new CreatePreferedNotificationDto();
        createPreferedNotificationDto.createdBy = memberId;
        createPreferedNotificationDto.memberId = memberId;
        createPreferedNotificationDto.isActive = true;
        createPreferedNotificationDto.notificationTypeId =
          element['notificationTypeId'];

        const response = await this.preferedNotificationRepository.save(
          this.preferedNotificationRepository.create(
            createPreferedNotificationDto,
          ),
        );

        preferedNotifications.push(response);
      });
    }

    return preferedNotifications;
  }

  /* Get a Record */
  async getPreferredNotification(
    notificationTypeId: number,
    recipientId: number,
  ) {
    let queryBuilder = getRepository(NotificationType)
      .createQueryBuilder('nt')
      .select('nt.id as notificationTypeId')
      .addSelect('preferednotification.isActive as isActive')
      .leftJoin('nt.preferednotification', 'preferednotification')
      .leftJoin('preferednotification.member', 'member')
      .andWhere('nt.id = :notificationTypeId AND member.id = :recipientId', {
        notificationTypeId: notificationTypeId,
        recipientId: recipientId,
      })
      .orderBy('nt.id');

    const preferedNotification = await queryBuilder.getRawOne();
    return preferedNotification;
  }

  // To get preferred Notification setted by Member in member profile.
  async getPreferredNotificationByNotificationTypeCode(
    notificationTypeCode: string,
    recipientId: number = null,
  ) {
    let queryBuilder = getRepository(NotificationType)
      .createQueryBuilder('nt')
      .select('nt.id as notificationTypeId');

    if (recipientId) {
      queryBuilder
        .addSelect('preferednotification.isActive as isActive')
        .leftJoin('nt.preferednotification', 'preferednotification')
        .leftJoin('preferednotification.member', 'member')
        .andWhere('member.id = :recipientId', { recipientId: recipientId });
    }

    queryBuilder
      .andWhere('nt.notificationTypeCode = :notificationTypeCode', {
        notificationTypeCode: notificationTypeCode,
      })
      .orderBy('nt.id');

    const preferedNotification = await queryBuilder.getRawOne();
    return preferedNotification;
  }
}
