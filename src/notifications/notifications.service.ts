import { Inject, Scope, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { PageDto } from 'src/utils/dtos/page.dto';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { Notifications } from './entities/notifications.entity';
import { CreateNotificationDto } from './dto/notifications.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { UnreadCountResponseDto } from 'src/messages/dto/unread-count-response.dto';
import { MemberInvitation } from 'src/member-invitations/entities/member-invitation.entity';
import { notificationTemplates } from 'src/utils/constants/notifications';
import { Farm } from 'src/farms/entities/farm.entity';
import { SearchOptionsFarmDto } from './dto/search-options-farm.dto';

@Injectable({ scope: Scope.REQUEST })
export class NotificationsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Notifications)
    private notificationsRepository: Repository<Notifications>,
  ) {}

  /* Get all notifications */
  async findAll(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<NotificationResponseDto[]>> {
    const member = this.request.user;
    const queryBuilder = getRepository(Notifications)
      .createQueryBuilder('notifications')
      .select(
        'notifications.id,notifications.notificationUuid as notificationId, notifications.notificationShortUrl, notifications.messageTemplateId, notifications.messageTitle, notifications.recipientId, notifications.messageText, notifications.isRead, notifications.createdOn as timeStamp, notifications.notificationType as notificationTypeId, notifications.actionUrl as actionUrl,0 as isInviteAccepted',
      )
      .addSelect(
        'messagetemplate.linkName as linkName, messagetemplate.messageTemplateUuid as messageTemplateUuid',
      )
      .addSelect('feature.id as featureId, feature.featureName as featureName')
      .addSelect('messagetype.id as messageTypeId, messagetype.messageTypeName')
      .addSelect('sender.id as senderId, sender.fullName as senderName')
      .addSelect('notificationtype.notificationTypeName as notificationType')
      .leftJoin('notifications.messagetemplate', 'messagetemplate')
      .leftJoin('messagetemplate.feature', 'feature')
      .leftJoin('messagetemplate.messagetype', 'messagetype')
      .leftJoin('notifications.sender', 'sender')
      .leftJoin('notifications.notificationtype', 'notificationtype')
      .andWhere('notifications.recipientId = :recipientId', {
        recipientId: member['id'],
      });

    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      if (sortBy.toLowerCase() === 'unread') {
        queryBuilder.addOrderBy('notifications.isRead', 'ASC');
      }
      if (sortBy.toLowerCase() === 'read') {
        queryBuilder.orderBy('notifications.isRead', 'DESC');
      }
    }
    if (searchOptionsDto.order) {
      queryBuilder.addOrderBy(
        'notifications.createdOn',
        searchOptionsDto.order,
      );
    }
    if (searchOptionsDto.page && searchOptionsDto.limit == 2) {
      queryBuilder.offset(searchOptionsDto.skip).limit(searchOptionsDto.limit);
    }

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    await entities.reduce(async (promise, element) => {
      await promise;
      if (
        element.messageTemplateUuid ==
        notificationTemplates.inviteOtherMembersToAFarmUuid
      ) {
        let date = new Date(element.timeStamp);
        date.setSeconds(date.getSeconds() - 10);
        const queryBuilder = getRepository(MemberInvitation)
          .createQueryBuilder('mi')
          .select(
            'mi.id as invitationId,mi.farmId as farmId, mi.memberId as recipientId, mi.createdBy as createdBy,mi.isAccepted as isAccepted',
          )
          .andWhere('mi.memberId = :memberId', {
            memberId: element.recipientId,
          })
          .andWhere('mi.createdBy = :createdBy', {
            createdBy: element.senderId,
          })
          .andWhere('mi.createdOn BETWEEN :fromDate AND :toDate', {
            fromDate: date,
            toDate: element.timeStamp,
          });

        let record = await queryBuilder.getRawOne();
        if (record?.isAccepted) {
          element.isInviteAccepted = 1;
        }
      }
    }, Promise.resolve());

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  /* Get all notifications of a farm*/
  async findForFarm(
    searchOptionsDto: SearchOptionsFarmDto,
  ): Promise<PageDto<NotificationResponseDto[]>> {

    const member = this.request.user;

    const farm = await getRepository(Farm).createQueryBuilder('farm')
      .select('farm.id, farm.farmName')
      .andWhere('farm.farmUuid = :farmUuid',{farmUuid:searchOptionsDto.farmId})
      .getRawOne();

    if(!farm){
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            farm: 'notFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const queryBuilder = getRepository(Notifications)
      .createQueryBuilder('notifications')
      .select(
        'notifications.id,notifications.notificationUuid as notificationId, notifications.notificationShortUrl, notifications.messageTemplateId, notifications.messageTitle, notifications.recipientId, notifications.messageText, notifications.isRead, notifications.createdOn as timeStamp, notifications.notificationType as notificationTypeId, notifications.actionUrl as actionUrl,0 as isInviteAccepted',
      )
      .addSelect(
        'messagetemplate.linkName as linkName, messagetemplate.messageTemplateUuid as messageTemplateUuid',
      )
      .addSelect('feature.id as featureId, feature.featureName as featureName')
      .addSelect('messagetype.id as messageTypeId, messagetype.messageTypeName')
      .addSelect('sender.id as senderId, sender.fullName as senderName')
      .addSelect('notificationtype.notificationTypeName as notificationType')
      .leftJoin('notifications.messagetemplate', 'messagetemplate')
      .leftJoin('messagetemplate.feature', 'feature')
      .leftJoin('messagetemplate.messagetype', 'messagetype')
      .leftJoin('notifications.sender', 'sender')
      .leftJoin('notifications.notificationtype', 'notificationtype')
      .andWhere('notifications.farmid = :farmid', {
        farmid: farm['id'],
      })
      .andWhere('notifications.recipientId = :recipientId', {
        recipientId: member['id'],
      });

    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      if (sortBy.toLowerCase() === 'unread') {
        queryBuilder.addOrderBy('notifications.isRead', 'ASC');
      }
      if (sortBy.toLowerCase() === 'read') {
        queryBuilder.orderBy('notifications.isRead', 'DESC');
      }
    }
    if (searchOptionsDto.order) {
      queryBuilder.addOrderBy(
        'notifications.createdOn',
        searchOptionsDto.order,
      );
    }
    if (searchOptionsDto.page && searchOptionsDto.limit == 2) {
      queryBuilder.offset(searchOptionsDto.skip).limit(searchOptionsDto.limit);
    }

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  /* Get notifications count */
  async getCount(): Promise<UnreadCountResponseDto> {
    const member = this.request.user;
    const unreadCount = await getRepository(Notifications)
      .createQueryBuilder('notifications')
      .select('notifications.notificationUuid as notificationId')
      .andWhere('notifications.recipientId = :recipientId', {
        recipientId: member['id'],
      })
      .andWhere('notifications.isRead = :isRead', { isRead: 0 })
      .getCount();

    return { unreadCount: unreadCount };
  }

  /* Get a notification */
  async findOne(id: number): Promise<NotificationResponseDto[]> {
    const entities: any = await this.notificationsRepository.find({ id });
    return entities;
  }

  /* Delete a notification */
  deleteNotification(updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsRepository.delete({
      notificationUuid: updateNotificationDto.notificationUuid,
    });
  }

  /* Add a notification */
  async create(createNotificationRequest: CreateNotificationDto) {
    const response = await this.notificationsRepository.save(
      this.notificationsRepository.create(createNotificationRequest),
    );
    return response;
  }

  /* Update a notification */
  async updateNotification(updateNotificationDto: UpdateNotificationDto) {
    const member = this.request.user;
    updateNotificationDto.modifiedBy = member['id'];
    updateNotificationDto.isRead = true;
    const response = await this.notificationsRepository.update(
      { notificationUuid: updateNotificationDto.notificationUuid },
      updateNotificationDto,
    );

    return response;
  }
}
