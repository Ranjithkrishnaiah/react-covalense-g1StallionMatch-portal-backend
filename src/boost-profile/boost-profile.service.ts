import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { CreateLocalBoostProfileDto } from './dto/create-local-boost-profile.dto';
import { BoostProfile } from './entities/boost-profile.entity';
import { BoostStallion } from './entities/boost-stallion.entity';
import { BoostUserLocation } from './entities/boost-user-location.entity';
import { BoostSearchedDamSire } from './entities/boost-searched-damsire.entity';
import { ActivityEntity } from 'src/activity-module/activity.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { MemberAddress } from 'src/member-address/entities/member-address.entity';
import { Member } from 'src/members/entities/member.entity';
import { SearchStallionMatch } from 'src/search-stallion-match/entities/search-stallion-match.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { FavouriteStallion } from 'src/favourite-stallions/entities/favourite-stallion.entity';
import { PotentialAudienceDto } from 'src/carts/dto/potential-audience.dto';
import { Message } from 'src/messages/entities/messages.entity';
import { MessageChannel } from 'src/message-channel/entities/message-channel.entity';
import { MessageChannelService } from 'src/message-channel/message-channel.service';
import { MessageRecipientsService } from 'src/message-recepient/message-recipients.service';
import { notificationTemplates, notificationType } from 'src/utils/constants/notifications';
import { StallionPromotion } from 'src/stallion-promotions/entities/stallion-promotion.entity';
import { PreferedNotificationService } from 'src/prefered-notifications/prefered-notifications.service';
import { boostTypes } from 'src/utils/constants/messaging';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MembersService } from 'src/members/members.service';
import { ACTIVITY_TYPE } from 'src/utils/constants/common';

@Injectable({ scope: Scope.REQUEST })
export class BoostProfileService {

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(BoostProfile)
    private boostProfileRepository: Repository<BoostProfile>,
    private notificationsService: NotificationsService,
    private messageTemplatesService: MessageTemplatesService,
    private messageChannelService: MessageChannelService,
    private messageRecipientsService: MessageRecipientsService,
    private preferedNotificationService: PreferedNotificationService,
    private eventEmitter: EventEmitter2,
    private memberService: MembersService,
    ) {

  }

  async create(createLocalBoostProfileDto: CreateLocalBoostProfileDto) {
    const createOrderResponse = await this.boostProfileRepository.save(
      this.boostProfileRepository.create(createLocalBoostProfileDto),
    );
    return createOrderResponse
  }

  async sendBoostNotification(boostProfileId: number, boostProfileType: number, createdBy: number, fullName: string, email: string) {
    let userIds = []
    let boostProfile = await this.boostProfileRepository.findOne(boostProfileId)
    let boostStallions = await getRepository(BoostStallion).createQueryBuilder("bs")
      .select('stallion.stallionUuid as stallionId')
      .innerJoin('bs.stallion', 'stallion')
      .andWhere("bs.boostProfileId =:boostProfileId", { 'boostProfileId': boostProfileId })
      .getRawMany()
    if (boostStallions && boostStallions.length > 0) {
      let selectedIds = boostStallions.map(item => {
        return item.stallionId
      })

      let recipientsByStallionsQueryBuilder = await getRepository(ActivityEntity).createQueryBuilder("activity")
        .select('DISTINCT activity.createdBy as createdBy,member.email email')
        .innerJoin('activity.member', 'member')
        .andWhere("activity.activityTypeId = :activityType", { activityType: ACTIVITY_TYPE.READ })
        .andWhere("activity.stallionId IN(:...stallionIds)", { 'stallionIds': selectedIds })
        .getRawMany()
      let userIdsFromStallions = recipientsByStallionsQueryBuilder.map(item => {
        return { id: item.createdBy, email: item.email }
      })
      userIds = [...userIds, ...userIdsFromStallions]
    }

    let boostUserLocations = await getRepository(BoostUserLocation).createQueryBuilder("bul")
      .select('bul.countryId countryId')
      .andWhere("bul.boostProfileId =:boostProfileId", { 'boostProfileId': boostProfileId })
      .getRawMany()
    if (boostUserLocations && boostUserLocations.length > 0) {
      let selectedIds = boostUserLocations.map(item => {
        return item.countryId
      })

      let recipientsByUserLocationsQueryBuilder = await getRepository(Member).createQueryBuilder("member")
        .select('DISTINCT member.id memberId,member.email email')
        .innerJoin('member.memberaddress', 'ma')
        .andWhere("ma.countryId IN(:...countryIds)", { 'countryIds': selectedIds })
        .getRawMany()
      let userIdsFromLocations = recipientsByUserLocationsQueryBuilder.map(item => {
        return { id: item.memberId, email: item.email }
      })
      userIds = [...userIds, ...userIdsFromLocations]
    }

    let boostSearchedDamsire = await getRepository(BoostSearchedDamSire).createQueryBuilder("bsdm")
      .select('bsdm.horseId horseId')
      .andWhere("bsdm.boostProfileId =:boostProfileId", { 'boostProfileId': boostProfileId })
      .getRawMany()
    if (boostSearchedDamsire && boostSearchedDamsire.length > 0) {
      let selectedIds = boostSearchedDamsire.map(item => {
        return item.horseId
      })

      let userIdsFromSearchedDamsireQuery = await getRepository(SearchStallionMatch).createQueryBuilder("ssm")
        .select('DISTINCT ssm.createdBy as createdBy, member.email email')
        .innerJoin('ssm.mare', 'mare')
        .innerJoin('ssm.member', 'member')
        .andWhere("mare.sireId IN (:...damsireIds)", { damsireIds: selectedIds })
        .andWhere('ssm.createdBy IS NOT NULL')
        .getRawMany();

      let userIdsFromSearchedDamsire = userIdsFromSearchedDamsireQuery.map(item => {
        return { id: item.createdBy, email: item.email }
      })
      userIds = [...userIds, ...userIdsFromSearchedDamsire]
    }

    const trackedFarmStallionQB = await getRepository(Stallion).createQueryBuilder("stallion")
      .select('stallion.id as stallionId')
      .andWhere("stallion.createdBy = :createdBy", { createdBy: createdBy })
      .getRawMany();
    let selectedIds = trackedFarmStallionQB.map(item => {
      return item.stallionId
    })

    if (boostProfile.isTrackedFarmStallion) {

      let userIdsFromTrackedFarmStallionQuery = await getRepository(FavouriteStallion).createQueryBuilder("fs")
        .select('DISTINCT fs.createdBy as createdBy, member.email email')
        .innerJoin('fs.member', 'member')
        .andWhere("fs.stallionId IN (:...stallionIds)", { stallionIds: selectedIds })
        .getRawMany();

      let userIdsFromTrackedFarmStallion = userIdsFromTrackedFarmStallionQuery.map(item => {
        return { id: item.createdBy, email: item.email }
      })
      userIds = [...userIds, ...userIdsFromTrackedFarmStallion]

    }

    if (boostProfile.isSearchedFarmStallion) {

      let userIdsFromSearchedStallionsQuery = await getRepository(SearchStallionMatch).createQueryBuilder("ssm")
        .select('DISTINCT ssm.createdBy as createdBy, member.email email')
        .innerJoin('ssm.member', 'member')
        .andWhere("ssm.stallionId IN (:...stallionIds)", { stallionIds: selectedIds })
        .andWhere('ssm.createdBy IS NOT NULL')
        .getRawMany();

      let userIdsFromSearchedStallions = userIdsFromSearchedStallionsQuery.map(item => {
        return { id: item.createdBy, email: item.email }
      })
      userIds = [...userIds, ...userIdsFromSearchedStallions]
    }


    if (userIds && userIds.length > 0) {
      userIds = [...new Set(userIds)];

    const preferedNotification = await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(notificationType.MESSAGING)
    const messageTemplate = await this.messageTemplatesService.getMessageTemplateByUuid(notificationTemplates.boostNotification);
      const messageTitle = messageTemplate.messageTitle;
      let subject = boostProfileType == boostTypes.LOCAL_BOOST ? "Local Boost" : "Extended Boost"
      let msgData = {
        subject: subject,
        message: boostProfile.message,
        fromMemberId: createdBy,
        createdBy: createdBy
      }

      let msg = await getRepository(Message).save(getRepository(Message).create(msgData),)

      let channelUuid, msgChannelId;

      const getChannel = await this.messageChannelService.findWhere({ txEmail: email, rxId: null, isActive: true })
      if (getChannel.length > 0) {
        msgChannelId = getChannel[0].id;
        channelUuid = getChannel[0].channelUuid;
      } else {
        channelUuid = uuidv4()

        let channelObj = await getRepository(MessageChannel).save(
          getRepository(MessageChannel).create({ channelUuid: channelUuid, txId: createdBy, txEmail: email, rxId: null, isActive: true }),
        );

        msgChannelId = channelObj.id;
      }


      userIds.forEach(async item => {

        this.notificationsService.create({
          createdBy: createdBy,
          messageTemplateId: messageTemplate?.id,
          notificationShortUrl: 'notificationShortUrl',
          recipientId: item.id,
          messageTitle,
          messageText: boostProfile.message,
          isRead: false,
          notificationType: preferedNotification?.notificationTypeId,
          actionUrl: null
        });

        let msgRxDto = {
          messageId: msg.id,
          recipientId: item.id,
          recipientEmail: item.email,
          createdBy: createdBy,
          channelId: msgChannelId,
          isRead: false,

        }
        await this.messageRecipientsService.create(msgRxDto)

      })
    }

  }

  async getBoostProfileRecipients(potentialAudienceDto: PotentialAudienceDto) {
    let userIds = []

    if (potentialAudienceDto.stallions && potentialAudienceDto.stallions.length > 0) {

      let recipientsByStallionsQueryBuilder = await getRepository(ActivityEntity).createQueryBuilder("activity")
        .select('DISTINCT activity.createdBy as createdBy')
        .andWhere("activity.activityTypeId = :activityType", { activityType: ACTIVITY_TYPE.READ })
        .andWhere("activity.stallionId IN(:...stallionIds)", { 'stallionIds': potentialAudienceDto.stallions })
        .getRawMany()
      let userIdsFromStallions = recipientsByStallionsQueryBuilder.map(item => {
        return item.createdBy
      })
      userIds = [...userIds, ...userIdsFromStallions]
    }

    if (potentialAudienceDto.locations && potentialAudienceDto.locations.length > 0) {

      let recipientsByUserLocationsQueryBuilder = await getRepository(MemberAddress).createQueryBuilder("ma")
        .select('DISTINCT ma.memberId')
        .andWhere("ma.countryId IN(:...countryIds)", { 'countryIds': potentialAudienceDto.locations })
        .getRawMany()
      let userIdsFromLocations = recipientsByUserLocationsQueryBuilder.map(item => {
        return item.memberId
      })
      userIds = [...userIds, ...userIdsFromLocations]
    }

    if (potentialAudienceDto.damSireSearchedUsers && potentialAudienceDto.damSireSearchedUsers.length > 0) {
      let userIdsFromSearchedDamsireQuery = await getRepository(SearchStallionMatch).createQueryBuilder("ssm")
        .select('DISTINCT ssm.createdBy as createdBy')
        .innerJoin('ssm.mare', 'horse')
        .innerJoin('horse.sire', 'sire')
        .andWhere("sire.horseUuid IN (:...damsireIds)", { damsireIds: potentialAudienceDto.damSireSearchedUsers })
        .andWhere('ssm.createdBy IS NOT NULL')
        .getRawMany();

      let userIdsFromSearchedDamsire = userIdsFromSearchedDamsireQuery.map(item => {
        return item.createdBy
      })
      userIds = [...userIds, ...userIdsFromSearchedDamsire]
    }

    const trackedFarmStallionQB = await getRepository(Stallion).createQueryBuilder("stallion")
      .select('stallion.id as stallionId')
      .andWhere("stallion.createdBy = :createdBy", { createdBy: potentialAudienceDto.createdBy })
      .getRawMany();
    let selectedIds = trackedFarmStallionQB.map(item => {
      return item.stallionId
    })

    if (potentialAudienceDto.isTracked) {

      let userIdsFromTrackedFarmStallionQuery = await getRepository(FavouriteStallion).createQueryBuilder("fs")
        .select('DISTINCT fs.createdBy as createdBy')
        .andWhere("fs.stallionId IN (:...stallionIds)", { stallionIds: selectedIds })
        .getRawMany();

      let userIdsFromTrackedFarmStallion = userIdsFromTrackedFarmStallionQuery.map(item => {
        return item.createdBy
      })
      userIds = [...userIds, ...userIdsFromTrackedFarmStallion]

    }

    if (potentialAudienceDto.isSearched) {

      let userIdsFromSearchedStallionsQuery = await getRepository(SearchStallionMatch).createQueryBuilder("ssm")
        .select('DISTINCT ssm.createdBy as createdBy')
        .andWhere("ssm.stallionId IN (:...stallionIds)", { stallionIds: selectedIds })
        .andWhere('ssm.createdBy IS NOT NULL')
        .getRawMany();

      let userIdsFromSearchedStallions = userIdsFromSearchedStallionsQuery.map(item => {
        return item.createdBy
      })
      userIds = [...userIds, ...userIdsFromSearchedStallions]
    }
    return userIds;
  }

  async sendBoostNotificationWhenStallionPromotes(boostDto) {
    console.log('========================sendBoostNotificationWhenStallionPromotes',boostDto)

    const getUsersQuery = await getRepository(StallionPromotion).createQueryBuilder("sp")
      .select('member.id id, member.email email, farm.id farmid, farm.farmName farmName')
      .innerJoin('sp.stallion', 'stallion')
      .innerJoin('stallion.farm', 'farm')
      .innerJoin('farm.memberfarms', 'memberfarms')
      .innerJoin('memberfarms.member', 'member')
      .andWhere("sp.id = :id", { id: boostDto.promotionId })
      .getRawMany();
    let userIds = await getUsersQuery.map(item => {
      return { id: item.id, email: item.email }
    })
    if (userIds && userIds.length > 0) {
      let user = await this.memberService.findOne({id:boostDto.createdBy});
      this.request['user'] = user;
      this.request['farmName'] = getUsersQuery[0].farmName;
      await this.eventEmitter.emitAsync('boostActivity', {
        originalData: this.request
      });
      userIds = [...new Set(userIds)];

      const preferedNotification = await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(notificationType.MESSAGING);
      const messageTemplate = await this.messageTemplatesService.getMessageTemplateByUuid(notificationTemplates.boostNotification);
      const messageTitle = messageTemplate.messageTitle;
      let subject = boostDto.boostType == boostTypes.LOCAL_BOOST ? "Local Boost" : "Extended Boost"
      let message = "Get more eyes on your Stallions.Find out how to boost their profiles"
      let msgData = {
        subject: subject,
        message: message,
        fromMemberId: boostDto.createdBy,
        createdBy: boostDto.createdBy
      }

      let msg = await getRepository(Message).save(getRepository(Message).create(msgData),)
      let channelUuid, msgChannelId;

      const getChannel = await this.messageChannelService.findWhere({ txEmail: boostDto.email, rxId: null, isActive: true })
      if (getChannel.length > 0) {
        msgChannelId = getChannel[0].id;
        channelUuid = getChannel[0].channelUuid;
      }
      else {
        channelUuid = uuidv4()

        let channelObj = await getRepository(MessageChannel).save(
          getRepository(MessageChannel).create({ channelUuid: channelUuid, txId: boostDto.createdBy, txEmail: boostDto.email, rxId: null, isActive: true }),
        );

        msgChannelId = channelObj.id;
      }
      userIds.forEach(async item => {
        this.notificationsService.create({
          createdBy: boostDto.createdBy,
          messageTemplateId: messageTemplate?.id,
          notificationShortUrl: 'notificationShortUrl',
          recipientId: item.id,
          messageTitle,
          messageText: message,
          isRead: false,
          notificationType: preferedNotification?.notificationTypeId,
          actionUrl: null
        });

        let msgRxDto = {
          messageId: msg.id,
          recipientId: item.id,
          recipientEmail: item.email,
          createdBy: boostDto.createdBy,
          channelId: msgChannelId,
          isRead: false,

        }
        await this.messageRecipientsService.create(msgRxDto)

      })

    }
  }


}
