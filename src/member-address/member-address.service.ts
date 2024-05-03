import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/members/entities/member.entity';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PreferedNotificationService } from 'src/prefered-notifications/prefered-notifications.service';
import { Repository } from 'typeorm';
import { CreateMemberAddressDto } from './dto/create-member-address.dto';
import { UpdateMemberAddressDto } from './dto/update-member-address.dto';
import { MemberAddress } from './entities/member-address.entity';
import {
  notificationTemplates,
  notificationType,
} from 'src/utils/constants/notifications';

@Injectable()
export class MemberAddressService {
  constructor(
    @InjectRepository(MemberAddress)
    private memberAddressRepository: Repository<MemberAddress>,
    private notificationsService: NotificationsService,
    private messageTemplatesService: MessageTemplatesService,
    private readonly preferedNotificationService: PreferedNotificationService,
  ) {}

  /* Create a record for member address */
  async create(member: Member, addressDto: CreateMemberAddressDto) {
    let record = await this.findMemberAddress(member.id);
    if (record) {
      return await this.update(member, addressDto);
    }
    let data = {
      ...addressDto,
      memberId: member.id,
      createdBy: member.id,
    };
    const created = await this.memberAddressRepository.save(
      this.memberAddressRepository.create(data),
    );

    if (created) {
      await this.sendNotification(member);
    }
    return created;
  }

  /* Update a member address */
  async update(member: Member, addressDto: UpdateMemberAddressDto) {
    let data = {
      ...addressDto,
      memberId: member.id,
      modifiedBy: member.id,
    };
    return this.memberAddressRepository.update({ memberId: member.id }, data);
  }

  /* Get a member address */
  async findMemberAddress(memberId) {
    const queryBuilder = this.memberAddressRepository
      .createQueryBuilder('memberaddress')
      .select(
        'memberaddress.countryId, memberaddress.stateId, memberaddress.city, memberaddress.address, memberaddress.postcode,currency.currencyCode',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName, state.stateCode as stateCode')
      .leftJoin('memberaddress.country', 'country')
      .leftJoin('country.currency', 'currency')
      .leftJoin('memberaddress.state', 'state')
      .andWhere({ memberId: memberId })
      .orderBy('memberaddress.createdOn', 'DESC');
    return await queryBuilder.getRawOne();
  }

  /* Get a member address by member */
  async findMemberInfo(member: any) {
    return this.memberAddressRepository.findOne({ memberId: member.id });
  }

  /* Get a member address by member */
  async findOne(member: Member) {
    return await this.memberAddressRepository.findOne({ memberId: member.id });
  }

  /* Send Notification on Member Address add/update */
  async sendNotification(member) {
    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        notificationTemplates.updateMissingInformationProfile,
      );

    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.MEMBERSHIP_UPDATES,
      );

    if (messageTemplate) {
      const messageText = messageTemplate.messageText;
      const messageTitle = messageTemplate.messageTitle;
      let actionUrl = messageTemplate.linkAction;
      await this.notificationsService.create({
        createdBy: member.id,
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: member.id,
        messageTitle,
        messageText,
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
        actionUrl,
      });
    }
  }
}
