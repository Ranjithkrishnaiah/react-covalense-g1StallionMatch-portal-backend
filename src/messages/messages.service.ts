import {
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { FarmProfileImage } from 'src/farm-profile-image/entities/farm-profile-image.entity';
import { Farm } from 'src/farms/entities/farm.entity';
import { FarmsService } from 'src/farms/farms.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesService } from 'src/horses/horses.service';
import { MailService } from 'src/mail/mail.service';
import { MemberFarmsService } from 'src/member-farms/member-farms.service';
import { MemberProfileImage } from 'src/member-profile-image/entities/member-profile-image.entity';
import { Member } from 'src/members/entities/member.entity';
import { MembersService } from 'src/members/members.service';
import { MessageChannelService } from 'src/message-channel/message-channel.service';
import { MessageMedia } from 'src/message-media/entities/message-media.entity';
import { MessageRecipientsService } from 'src/message-recepient/message-recipients.service';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { NominationRequest } from 'src/nomination-request/entities/nomination-request.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { PreferedNotificationService } from 'src/prefered-notifications/prefered-notifications.service';
import { StallionsService } from 'src/stallions/stallions.service';
import {
  notificationTemplates,
  notificationType,
} from 'src/utils/constants/notifications';
import { Repository, getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ChannelDto } from './dto/channel.dto';
import { CreateChannelPayloadDto } from './dto/create-channel-payload.dto';
import { CreateMessageUnregisteredDto } from './dto/create-message-unregistered.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { EnquiredFarmMessagesResponseDto } from './dto/enquired-farm-message-response.dto';
import { MessagesByFarmResponseDto } from './dto/messages-by-farm-response.dto';
import { MessageCountResponseDto } from './dto/messages-count-response.dto';
import { MessagesListResponseDto } from './dto/messages-list-response.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UnreadCountResponseDto } from './dto/unread-count-response.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/messages.entity';

@Injectable({ scope: Scope.REQUEST })
export class MessageService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private farmsService: FarmsService,
    private messageRecipientsService: MessageRecipientsService,
    private stallionsService: StallionsService,
    private messageTemplatesService: MessageTemplatesService,
    private notificationsService: NotificationsService,
    private messageChannelService: MessageChannelService,
    private membersService: MembersService,
    private memberFarmsService: MemberFarmsService,
    private horseService: HorsesService,
    private mailService: MailService,
    private preferedNotificationService: PreferedNotificationService,
    private commonUtilsService: CommonUtilsService,
    private fileUploadsService: FileUploadsService,
  ) {}
  /* Get All Messages */
  async findAll(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<MessagesListResponseDto[]> {
    const member = this.request.user;
    // await this.messageChannelService.update(
    //   { txEmail: member['email'] },
    //   { txId: member['id'] },
    // );
    let mmQueryBuilder = getRepository(MessageMedia)
      .createQueryBuilder('mm')
      .select(
        'mm.messageId as mediaMessageId, media.mediauuid as mediauuid, media.mediaUrl as mediaUrl, media.mediaFileType as mediaFileType, media.fileName as mediaFileName',
      )
      .innerJoin('mm.media', 'media', 'media.id=mm.mediaId')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    let fpiQueryBuilder = getRepository(FarmProfileImage)
      .createQueryBuilder('fpi')
      .select('fpi.farmId as mediaFarmId, media.mediaUrl as farmMediaUrl')
      .innerJoin(
        'fpi.media',
        'media',
        'media.id=fpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    let mpiQueryBuilder = getRepository(MemberProfileImage)
      .createQueryBuilder('mpi')
      .select('mpi.memberId as mediaMemberId, media.mediaUrl as userProfilePic')
      .innerJoin(
        'mpi.media',
        'media',
        'media.id=mpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    let queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .select(
        'message.id as messageId, message.message as message, message.subject as subject, message.createdOn as timestamp, message.fullName as unregisteredName, mediaUrl, mediaFileType, mediauuid, mediaFileName',
      )
      .addSelect(
        'farm.farmUuid as farmId, farm.farmName as farmName, farm.id as farmIntId',
      )
      .addSelect('stallion.stallionUuid as stallionId')
      .addSelect('horse.horseName as horseName')
      .addSelect(
        'messagerecipient.channelId as msgChannelId, messagerecipient.recipientId as recipientId, messagerecipient.recipientEmail as recipientEmail ',
      )
      .addSelect('farmlocation.address as farmAddress')
      .addSelect('country.countryName as farmCountryName')
      .addSelect(
        'CASE WHEN frommember.memberuuid IS NOT NULL THEN frommember.memberuuid ELSE channelmember.memberuuid END as fromMemberUuid, CASE WHEN frommember.email IS NOT NULL THEN frommember.email ELSE channel.txEmail END as fromMemberEmail, CASE WHEN frommember.fullName IS NOT NULL THEN frommember.fullName ELSE message.fromName END as fromMemberName',
      )
      .addSelect('state.stateName as farmStateName')
      .addSelect(
        'channel.channelUuid as channelId, channel.isActive as isActive, CASE WHEN channel.txId IS NOT NULL THEN 1 ELSE 0 END as isRegistered, channel.isFlagged as isFlagged, CASE WHEN channel.txId IS NOT NULL AND (channel.rxId=0 OR channel.rxId IS NULL) THEN 1 ELSE 0 END as isBroadcast',
      )
      .addSelect('farmprofileimage.farmMediaUrl as farmImage')
      .addSelect('memberprofileimage.userProfilePic as senderImage')
      .leftJoin('message.farm', 'farm')
      .leftJoin('message.stallion', 'stallion')
      .leftJoin('stallion.horse','horse')
      .leftJoin('message.sender', 'sender')
      .leftJoin('message.frommember', 'frommember')
      .leftJoin('farm.farmlocations', 'farmlocation')
      .leftJoin('farmlocation.country', 'country')
      .leftJoin('farmlocation.state', 'state')
      .innerJoin('message.messagerecipient', 'messagerecipient')
      .innerJoin('messagerecipient.channel', 'channel')
      .leftJoin('channel.member', 'channelmember')
      .leftJoin(
        '(' + mmQueryBuilder.getQuery() + ')',
        'messagemedia',
        'mediaMessageId=message.id',
      )
      .leftJoin(
        '(' + fpiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=farm.id',
      )
      .leftJoin(
        '(' + mpiQueryBuilder.getQuery() + ')',
        'memberprofileimage',
        'mediaMemberId=channel.txId',
      )
      /* To hide previous anonymous chats after user registration  */
      .andWhere('messagerecipient.recipientId = :recipientId', {
        recipientId: member['id'],
      });

    // .andWhere('messagerecipient.recipientEmail = :recipientEmail', {
    //   recipientEmail: member['email'],
    // });

    const entities = await queryBuilder.getRawMany();

    let response = entities.reduce(function (r, a) {
      r[a.msgChannelId] = r[a.msgChannelId] || [];
      r[a.msgChannelId].push(a);
      return r;
    }, Object.create(null));

    let result = Object.keys(response)
      .map((channelId) => {
        response[channelId].sort(function (a, b) {
          return parseInt(b.messageId) - parseInt(a.messageId);
        });

        return response[channelId][0];
      })
      .sort(function (a, b) {
        return parseInt(b.messageId) - parseInt(a.messageId);
      });

    result = await Promise.all(
      result.map(async (Obj) => {
        Obj.unreadCount = (
          await this.messageRecipientsService.findResult({
            channelId: Obj.msgChannelId,
            recipientEmail: member['email'],
            isRead: 0,
          })
        ).length;
        const farmMembers = await this.memberFarmsService.findOne({
          farmId: Obj.farmIntId,
          memberId: member['id'],
        });
        Obj.memberRoleToTheFarm = !farmMembers
          ? 'Breeder'
          : farmMembers && farmMembers.isFamOwner == true
          ? 'FarmOwner'
          : 'FarmMember';
        delete Obj.farmIntId;
        delete Obj.recipientId;
        delete Obj.msgChannelId;
        return Obj;
      }),
    );

    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      if (sortBy.toLowerCase() === 'unread') {
        result = result.filter((obj) => {
          if (obj.unreadCount >= 1) return obj;
        });
      }
      if (sortBy.toLowerCase() === 'read') {
        result = result.filter((obj) => {
          if (obj.unreadCount == 0) return obj;
        });
      }
      if (sortBy.toLowerCase() === 'deleted') {
        result = result.filter((obj) => {
          if (obj.isActive == 0) return obj;
        });
      }
      if (sortBy.toLowerCase() != 'deleted') {
        result = result.filter((obj) => {
          if (obj.isActive == 1) return obj;
        });
      }
    }

    if (searchOptionsDto.filterByFarm) {
      result = result.filter((obj) => {
        if (obj.farmId == searchOptionsDto.filterByFarm) return obj;
      });
    }

    if (searchOptionsDto.search) {
      const searchTerm = searchOptionsDto.search.toLowerCase(); // Convert search term to lowercase
    
      result = result.filter((obj) => {
        return (
          (obj?.farmName && obj.farmName.toLowerCase().includes(searchTerm)) ||
          (obj?.message && obj.message.toLowerCase().includes(searchTerm)) ||
          (obj?.fromMemberName && obj.fromMemberName.toLowerCase().includes(searchTerm)) ||
          (obj?.horseName && obj.horseName.toLowerCase().includes(searchTerm)) 
        );
      });
    
    }

    return result;
  }

  /* Get Chat History - By Farm */
  async findMsgHistory(
    channelId,
    limit = 0,
  ): Promise<MessagesByFarmResponseDto[]> {
    const member = this.request.user;
    const msgChannelRes = await this.messageChannelService.findWhere({
      channelUuid: channelId,
    });
    if (!(msgChannelRes.length > 0)) {
      throw new NotFoundException('Not found!');
    }

    let mmQueryBuilder = getRepository(MessageMedia)
      .createQueryBuilder('mm')
      .select(
        'mm.messageId as mediaMessageId, media.mediauuid as mediauuid, media.mediaUrl as mediaUrl, media.mediaFileType as mediaFileType, media.fileName as mediaFileName',
      )
      .innerJoin('mm.media', 'media', 'media.id=mm.mediaId')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    let fpiQueryBuilder = getRepository(FarmProfileImage)
      .createQueryBuilder('fpi')
      .select('fpi.farmId as mediaFarmId, media.mediaUrl as farmMediaUrl')
      .innerJoin(
        'fpi.media',
        'media',
        'media.id=fpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    let mpiQueryBuilder = getRepository(MemberProfileImage)
      .createQueryBuilder('mpi')
      .select('mpi.memberId as mediaMemberId, media.mediaUrl as userProfilePic')
      .innerJoin(
        'mpi.media',
        'media',
        'media.id=mpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");
    /* Creating new channels for every conversation */
    // await this.messageRecipientsService.update(
    //   { recipientEmail: member['email'], channelId: msgChannelRes[0].id },
    //   { recipientId: member['id'] },
    // );
    // await this.messageChannelService.update(
    //   { id: msgChannelRes[0].id, txEmail: member['email'] },
    //   { txId: member['id'] },
    // );
    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select(
        'stallionnomination.id as nominationId,orderProductItem.stallionId as snomstallionId,op.orderId as orderId',
      )
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .leftJoin('orderProductItem.nominationrequest', 'stallionnomination')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'NOMINATION_STALLION'");

    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireHorse.horseName as sireName, sireHorse.yob as sireYob, sireHorse.id as sireProgenyId',
      )
      .addSelect('sireCountry.countryCode as sireCountryCode')
      .innerJoin('sireHorse.nationality', 'sireCountry')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let mareQueryBuilder = getRepository(Horse)
      .createQueryBuilder('mareHorse')
      .select(
        'mareHorse.horseName as mareName, mareHorse.yob as mareYob, mareHorse.id as mareProgenyId,mareHorse.sireId as sireId',
      )
      .addSelect('mareCountry.countryCode as mareCountryCode')
      .innerJoin('mareHorse.nationality', 'mareCountry')
      .andWhere('mareHorse.horseName IS NOT NULL');

    let queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .select(
        'message.id as messageId, message.message as message, message.createdOn as timestamp, message.subject as subject, message.fullName as unregisteredName, mediaUrl, mediaFileType, mediauuid, mediaFileName,message.fromName as fromName',
      )
      .addSelect('farm.farmName as farmName')
      .addSelect('messagerecipient.isRead as isRead')
      .addSelect('sender.memberuuid as senderId, sender.fullName as senderName')
      .addSelect('country.countryName as senderCountryName')
      .addSelect('state.stateName as senderStateName')
      .addSelect(
        'recipient.memberuuid as recipientId, recipient.fullName as recipientName',
      )
      .addSelect(
        'frommember.memberuuid as fromMemberId, frommember.fullName as fromMemberName',
      )
      .addSelect(
        'nr.id as nominationRequestId,nr.stallionId as nomstallionId,nr.isAccepted as isAccepted, nr.offerPrice as offerPrice, nr.isDeclined as isDeclined, nr.isCounterOffer as isCounterOffer, nr.counterOfferPrice as counterOfferPrice, nr.isClosed as isClosed',
      )
      .addSelect('mareNom.horseName as mareName, mareNom.yob as mareYob')
      .addSelect('mareNationality.countryCode as mareCountryCode')
      .addSelect(
        'broodmareSireTwo.sireName as broodmareSireName, broodmareSireTwo.sireYob as broodmareSireYob, broodmareSireTwo.sireCountryCode as broodmareSireCountryCode',
      )

      .addSelect(
        'mare.mareName as mareNameMsg, mare.mareYob as mareYobMsg,mare.mareCountryCode as mareCountryCodeMsg',
      )
      .addSelect(
        'broodmareSire.sireName as broodmareSireNameMsg, broodmareSire.sireYob as broodmareSireYobMsg, broodmareSire.sireCountryCode as broodmareSireCountryCodeMsg',
      )
      .addSelect('horse.horseName as horseName')
      .addSelect('horseTwo.horseName as stallionTitle')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect('channel.channelUuid as channelId')
      .addSelect('farmprofileimage.farmMediaUrl as farmImage')
      .addSelect('memberprofileimage.userProfilePic as senderImage')
      .addSelect('op.orderId as orderId')
      .leftJoin('message.farm', 'farm')
      .innerJoin('message.messagerecipient', 'messagerecipient') //provided leftJoin to get broadcast messages too
      .leftJoin('message.frommember', 'frommember')
      .innerJoin('messagerecipient.recipient', 'recipient')
      .leftJoin('message.sender', 'sender')
      .leftJoin('sender.memberaddress', 'memberaddress') //changed innerJoin to LeftJoin to get unregistered history
      .leftJoin('memberaddress.country', 'country')
      .leftJoin('memberaddress.state', 'state')
      .leftJoin('message.nominationrequest', 'nr')
      .leftJoin('nr.stallion', 'stallion')
      .leftJoin('nr.mare', 'mareNom')
      .leftJoin(
        '(' + mareQueryBuilder.getQuery() + ')',
        'mare',
        'mare.mareProgenyId=message.mareId',
      )
      .leftJoin('mareNom.nationality', 'mareNationality')
      .leftJoin('message.stallion', 'stallionTwo')
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')', //Provided to fetch paid orders
        'op',
        'nominationId=nr.id',
      )
      .leftJoin(
        'stallionTwo.horse',
        'horseTwo',
        'horseTwo.isVerified=1 AND horseTwo.isActive=1',
      )
      .leftJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .leftJoin('nr.currency', 'currency')
      .innerJoin('messagerecipient.channel', 'channel')
      .leftJoin(
        '(' + fpiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=farm.id',
      )
      .leftJoin(
        '(' + mpiQueryBuilder.getQuery() + ')',
        'memberprofileimage',
        'mediaMemberId=sender.id',
      )
      .leftJoin(
        '(' + mmQueryBuilder.getQuery() + ')',
        'messagemedia',
        'mediaMessageId=message.id',
      )
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'broodmareSire',
        'broodmareSire.sireProgenyId=mare.sireId',
      )
      .andWhere('messagerecipient.channelId = :channelId', {
        channelId: msgChannelRes[0].id,
      })
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'broodmareSireTwo',
        'broodmareSireTwo.sireProgenyId=mareNom.sireId',
      )
      .andWhere('messagerecipient.channelId = :channelId', {
        channelId: msgChannelRes[0].id,
      })
      .andWhere('messagerecipient.recipientEmail = :recipientEmail', {
        recipientEmail: member['email'],
      });
    if (limit && limit > 0) {
      queryBuilder.orderBy('message.createdOn', 'DESC').limit(limit);
    }
    const entities = await queryBuilder.getRawMany();
    let unique_set = [];
    const memberObj = await this.membersService.findOne({ id: member['id'] });
    entities.forEach((obj) => {
      if (obj.messageId in unique_set) {
        if (obj.recipientEmail == memberObj.email) {
          unique_set[obj.messageId] = obj; // update
        }
      } else {
        unique_set[obj.messageId] = obj; // create
      }
    });
    return unique_set.filter((n) => n);
  }
  /* Get Latest Messages - By Farm */
  async findAuthLatestTwoMessages(
    limit = 0,
    farmId,
  ): Promise<MessagesByFarmResponseDto[]> {
    const member = this.request.user;
    let queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .select(
        'message.id as messageId, message.message as message, message.createdOn as timestamp',
      )
      .addSelect('farm.farmName as farmName')
      .addSelect(
        'messagerecipient.recipientId as recipientId, messagerecipient.recipientEmail as recipientEmail, messagerecipient.isRead as isRead',
      )
      .addSelect('sender.fullName as senderName')
      .addSelect('recipient.fullName as recipientName')
      .addSelect('channel.channelUuid as channelId')
      .innerJoin(
        'message.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .innerJoin('message.messagerecipient', 'messagerecipient')
      .innerJoin('messagerecipient.recipient', 'recipient')
      .innerJoin('messagerecipient.sender', 'sender')
      .innerJoin('messagerecipient.channel', 'channel')
      .andWhere('messagerecipient.recipientEmail = :recipientEmail', {
        recipientEmail: member['email'],
      })
      .andWhere('message.email != :senderEmail', {
        senderEmail: member['email'],
      });

    if (farmId) {
      const record = await this.farmsService.findOne({ farmUuid: farmId });
      queryBuilder.andWhere('message.farmId = :farmId', { farmId: record.id });
    }

    if (limit) queryBuilder.orderBy('message.createdOn', 'DESC').limit(limit);

    const entities = await queryBuilder.getRawMany();
    return entities;
  }
  /* Get Unread Message Count */
  async getMsgCount(): Promise<UnreadCountResponseDto> {
    const member = this.request.user;
    const unreadCount = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.id')
      .innerJoin('message.messagerecipient', 'messagerecipient')
      .andWhere('messagerecipient.recipientId = :recipientId', {
        recipientId: member['id'],
      })
      .andWhere('messagerecipient.isRead = 0 AND message.isActive = 1')
      .getCount();

    return { unreadCount: unreadCount };
  }
  /* Get Message Count - By Farm */
  async allCounts(farmId): Promise<MessageCountResponseDto> {
    const member = this.request.user;
    const record = await this.farmsService.findOne({ farmUuid: farmId });
    let receivedCount = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.id')
      .innerJoin('message.messagerecipient', 'messagerecipient')
      .andWhere('message.farmId = :farmId', { farmId: record.id })
      .andWhere('messagerecipient.recipientEmail = :recipientEmail', {
        recipientEmail: member['email'],
      })
      .getCount();

    let sentCount = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.id')
      .andWhere('message.farmId = :farmId', { farmId: record.id })
      .andWhere('message.createdBy = :createdBy', { createdBy: member['id'] })
      .getCount();

    let nominationCount = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.id')
      .innerJoin('message.nominationrequest', 'nominationrequest')
      .andWhere('message.farmId = :farmId', { farmId: record.id })
      .andWhere('nominationrequest.isAccepted = 0')
      .andWhere('nominationrequest.isDeclined = 0')
      .andWhere('nominationrequest.isCounterOffer = 0')
      .getCount();

    let rxCount = receivedCount - sentCount > 0 ? receivedCount - sentCount : 0;
    return { received: rxCount, sent: sentCount, nomination: nominationCount };
  }
  /* Create a Message */
  async create(messageDto: CreateMessageDto) {
    const farm = await this.farmsService.findOne({
      farmUuid: messageDto.farmId,
    });
    if (!farm) {
      throw new NotFoundException('Farm not exist!');
    }
    let stallionIdNum: number;
    if (messageDto.stallionId) {
      const stallion = await this.stallionsService.findStallion({
        stallionUuid: messageDto.stallionId,
      });
      if (stallion) {
        stallionIdNum = stallion.id;
      }
    }
    const member = this.request.user;
    let fromUserId = null;
    let fromUserEmail = null;
    if (messageDto.fromMemberUuid) {
      const memberRec = await this.membersService.findOne({
        memberuuid: messageDto.fromMemberUuid,
      });
      fromUserId = memberRec.id;
      fromUserEmail = memberRec.email;
    }
    let msgData = {
      farmId: farm.id,
      message: messageDto.message,
      subject: messageDto.subject,
      fromMemberId: fromUserId,
      createdBy: member['id'],
      email: member['email'],
      fullName: member['fullName'],
      stallionId: stallionIdNum,
      nominationRequestId: messageDto.nominationRequestId,
    };

    let msg = await this.messageRepository.save(
      this.messageRepository.create(msgData),
    );
    messageDto['createdBy'] = member['id']; // to know message sender when sending mails
    if (!messageDto.channelId) {
      const getChannel = await this.messageChannelService.findWhere({
        // txEmail: member['email'],
        txId: member['id'], // Need to craete new channel for register user
        rxId: farm.id,
        isActive: true,
      });
      if (getChannel.length > 0) {
        messageDto.msgChannelId = getChannel[0].id;
        messageDto.channelId = getChannel[0].channelUuid;
      } else {
        messageDto.channelId = uuidv4().toLocaleUpperCase();
        const channelObj = await this.messageChannelService.create({
          channelUuid: messageDto.channelId,
          txId: member['id'],
          txEmail: member['email'],
          rxId: farm.id,
          isActive: true,
        });
        messageDto.msgChannelId = channelObj.id;
        if (messageDto.subject == 'General Enquiry') {
          messageDto.subject = 'Messages Page';
        }
      }
    }
    if (messageDto.channelId) {
      const msgChannelObj = await this.messageChannelService.findWhere({
        channelUuid: messageDto.channelId,
      });
      messageDto.msgChannelId = msgChannelObj[0].id;
    }

    const farmMembers = await this.farmsService.getFarmMembers(
      messageDto.farmId,
    );
    let memberIds = [];
    let msgRxDto = {
      messageId: msg.id,
      recipientId: null,
      recipientEmail: null,
      createdBy: member['id'],
      channelId: messageDto.msgChannelId,
      isRead: false,
    };
    const memberInfos = await this.membersService.findOne({ id: member['id'] });
    farmMembers.forEach(async (item) => {
      let fromMeberId = await this.membersService.findOne({
        memberuuid: item.memberId,
      });
      msgRxDto.recipientId = fromMeberId.id;
      msgRxDto.recipientEmail = fromMeberId.email;
      memberIds.push(item.memberId);
      await this.messageRecipientsService.create(msgRxDto);
      if (member['id'] != fromMeberId.id && messageDto.message.trim() != '') {
        await this.sendNotification(
          messageDto,
          fromMeberId.id,
          memberInfos['fullName'],
          member['id'],
        );
      }
    });

    const superAdminRoleId = parseInt(process.env.SUPER_ADMIN_ROLE_ID);

    const admins = await this.membersService.findByFilelds({
      roleId: superAdminRoleId,
    });
    await admins.forEach(async (item) => {
      let newmessageDto = { ...messageDto, role: superAdminRoleId };
      msgRxDto.recipientId = item.id;
      msgRxDto.recipientEmail = item.email;
      memberIds.push(item.id);
      await this.messageRecipientsService.create(msgRxDto);
      if (member['id'] != item.id && newmessageDto.message.trim() != '') {
        await this.sendNotification(
          newmessageDto,
          item.id,
          memberInfos['fullName'],
          member['id'],
        );
      }
    });

    if (!memberIds.includes(fromUserId)) {
      msgRxDto.recipientId = fromUserId;
      msgRxDto.recipientEmail = fromUserEmail;
      await this.messageRecipientsService.create(msgRxDto);
      const memberInfo = await this.membersService.findOne({
        id: member['id'],
      });
      if (member['id'] != fromUserId && messageDto.message.trim() != '') {
        await this.sendNotification(
          messageDto,
          fromUserId,
          memberInfo['fullName'],
          member['id'],
        );
      }
    }

    return { result: msg, channelId: messageDto.channelId.toUpperCase() };
  }
  /* Create a Message By Unregistered */
  async createUnregistered(messageDto: CreateMessageUnregisteredDto) {
    const {
      message,
      subject,
      fullName,
      email,
      cob,
      yob,
      mareId,
      mareName,
      fromName,
      fromEmail,
    } = messageDto;

    const farm = await this.farmsService.findOne({
      farmUuid: messageDto.farmId,
    });
    if (!farm) {
      throw new NotFoundException('Farm not exist!');
    }
    let stallionId: number;
    let stallionName: string;
    if (messageDto.stallionId) {
      const stallion = await this.stallionsService.findStallion({
        stallionUuid: messageDto.stallionId,
      });
      if (stallion) {
        stallionId = stallion.id;
        const horse = await getRepository(Horse).findOne({
          id: stallion['horseId'],
        });
        if (horse) {
          stallionName = horse.horseName;
        }
      }
    }
    let msgData = {
      farmId: farm.id,
      message: message,
      subject: subject,
      fullName: fullName,
      fromName: fromName,
      email: email,
      stallionId: stallionId,
      cob: cob,
      yob: yob,
      mareId: null,
      mareName: mareName,
      mareInfo: null,
      broodmareSireInfo: null,
    };
    if (mareId) {
      //const mare = await this.horseService.findHorsesByUuid(mareId);
      let sireQueryBuilder = getRepository(Horse)
        .createQueryBuilder('sireHorse')
        .select(
          'sireHorse.horseName as sireName, sireHorse.yob as sireYob, sireHorse.id as sireProgenyId',
        )
        .addSelect('sireCountry.countryCode as sireCountryCode')
        .innerJoin('sireHorse.nationality', 'sireCountry')
        .andWhere('sireHorse.horseName IS NOT NULL');

      let queryBuilder = getRepository(Horse)
        .createQueryBuilder('horse')
        .select(
          'horse.horseUuid as horseId, horse.id as id, horse.yob as mareYob, horse.horseName as horseName',
        )
        .addSelect('sire.sireName, sire.sireCountryCode, sire.sireYob')
        .addSelect('nationality.countryCode as mareCountryCode')
        .innerJoin('horse.nationality', 'nationality')
        .leftJoin(
          '(' + sireQueryBuilder.getQuery() + ')',
          'sire',
          'sireProgenyId=horse.sireId',
        )
        .andWhere('horse.horseUuid = :id', { id: mareId });

      const mare = await queryBuilder.getRawOne();
      msgData.mareId = mare.id;
      msgData.mareName = mare.horseName;
      msgData.mareInfo =
        (await this.commonUtilsService.toTitleCase(mare.horseName)) +
        ' (' +
        mare.mareYob +
        ', ' +
        mare.mareCountryCode +
        ')';
      msgData.broodmareSireInfo =
        (await this.commonUtilsService.toTitleCase(mare.sireName)) +
        ' (' +
        mare.sireYob +
        ', ' +
        mare.sireCountryCode +
        ')';
    }

    let msg = await this.messageRepository.save(
      this.messageRepository.create(msgData),
    );

    if (!messageDto.channelId) {
      /* Create new channel for every new conversation */
      // const getChannel = await this.messageChannelService.findWhere({
      //   txEmail: email,
      //   rxId: farm.id,
      //   isActive: true,
      // });

      // if (getChannel.length > 0) {
      //   messageDto.msgChannelId = getChannel[0].id;
      //   messageDto.channelId = getChannel[0].channelUuid;
      // }
      // else {
      messageDto.channelId = uuidv4().toLocaleUpperCase();
      const channelObj = await this.messageChannelService.create({
        channelUuid: messageDto.channelId,
        txEmail: email,
        rxId: farm.id,
        isActive: true,
        txId: null,
      });
      messageDto.msgChannelId = channelObj.id;
      if (messageDto.subject == 'General Enquiry') {
        messageDto.subject = 'Messages Page';
      }
      // }
    }
    if (messageDto.channelId) {
      const msgChannelObj = await this.messageChannelService.findWhere({
        channelUuid: messageDto.channelId,
      });
      messageDto.msgChannelId = msgChannelObj[0].id;
    }

    const farmMembers = await this.farmsService.getFarmMembers(
      messageDto.farmId,
    );

    let memberIds = [],
      memberEmailIds = [];
    let msgRxDto = {
      messageId: msg.id,
      recipientId: null,
      recipientEmail: null,
      createdBy: null,
      channelId: messageDto.msgChannelId,
      isRead: false,
    };
    farmMembers.forEach(async (item) => {
      let fromMeberId = await this.membersService.findOne({
        memberuuid: item.memberId,
      });
      msgRxDto.recipientId = fromMeberId.id;
      msgRxDto.recipientEmail = fromMeberId.email;

      memberIds.push(item.memberId);
      memberEmailIds.push(item.memberEmail);
      const createMessage = await this.messageRecipientsService.create(
        msgRxDto,
      );

      if (createMessage && item.memberEmail && email == fromEmail) {
        let origin = messageDto.subject.replace('Enquiry', 'Page');
        this.mailService.unregisteredMessage({
          to: item.memberEmail,
          data: {
            fullName: await this.commonUtilsService.toTitleCase(fullName),
            FarmUserName: await this.commonUtilsService.toTitleCase(
              fromMeberId.fullName,
            ),
            stallionName: await this.commonUtilsService.toTitleCase(
              stallionName,
            ),
            mareName: await this.commonUtilsService.toTitleCase(
              msgData.mareName,
            ),
            origin: origin,
            countryName: await this.commonUtilsService.toTitleCase(
              messageDto.countryName,
            ),
            message: message,
            mareInfo: msgData.mareInfo,
            broodmareSireInfo: msgData.broodmareSireInfo,
            time: this.formatAMPM(new Date()),
            replyNow:
              process.env.FRONTEND_DOMAIN +
              '/' +
              process.env.FRONTEND_APP_MESSAGES_THREAD_URI +
              messageDto.channelId,
            farmName: farm.farmName,
          },
        });
      }

      // if (email != fromMeberId.email && messageDto.message.trim() != '') {
      //   await this.sendNotificationUnregistered(
      //     messageDto,
      //     fromMeberId.id,
      //     fullName,
      //     null,
      //   );
      // }
    });
    const superAdminRoleId = parseInt(process.env.SUPER_ADMIN_ROLE_ID);

    const admins = await this.membersService.findByFilelds({
      roleId: superAdminRoleId,
    });

    admins.forEach(async (item) => {
      msgRxDto.recipientId = item.id;
      msgRxDto.recipientEmail = item.email;
      memberIds.push(item.id);
      memberEmailIds.push(item.email);
      await this.messageRecipientsService.create(msgRxDto);
      if (email != item.email && messageDto.message.trim() != '') {
        await this.sendNotificationUnregistered(
          messageDto,
          item.id,
          fullName,
          null,
        );
      }
    });

    if (!memberEmailIds.includes(fromEmail)) {
      let msgRxDto = {
        messageId: msg.id,
        recipientId: null,
        recipientEmail: fromEmail,
        fullName: fromName,
        createdBy: null,
        channelId: messageDto.msgChannelId,
        isRead: false,
      };
      await this.messageRecipientsService.create(msgRxDto);
      if (email != fromEmail && messageDto.message.trim() != '') {
        // let isMemberExist = await this.membersService.findOne({
        //   email: fromEmail,
        // });
        // if (isMemberExist) {
        //   await this.sendNotificationUnregistered(
        //     messageDto,
        //     isMemberExist.id,
        //     fullName,
        //     null,
        //   );
        // } else {
        await this.sendNotificationUnregistered(
          messageDto,
          null,
          fullName,
          null,
        );
        // }
      }
    }

    return msg;
  }
  /* Format Date */
  formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  /* Get Message */

  findOne(fields) {
    return this.messageRepository.findOne({
      where: fields,
    });
  }
  /* Send Notification For Registered User */
  async sendNotification(messageDto, recipientId, fullName, fromUserId) {
    let messageTemplateUuid = notificationTemplates.youHaveNewMessage;
    let template;
    let template1,subjectOne,subjectTwo;
    let fromMemberName = await this.commonUtilsService.toTitleCase(fullName);
    let messageTextFromMember = messageDto.message;
    let messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        messageTemplateUuid,
      );
    let messageText = messageTemplate.messageText
      .replace('{UserName}', fromMemberName)
      .replace('{message}', messageTextFromMember);
    let messageTitle = messageTemplate.messageTitle;
    let actionUrlValue = messageTemplate.linkAction
      .replace('{channelId}', messageDto.channelId)
      .toString()
      .trim();
    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.MESSAGING,
      );
    const farms = await this.farmsService.getFarmByUuid(messageDto.farmId);
    let mesgInfo = [];
    if (messageDto.fromMemberUuid) {
      const memFrom = await getRepository(Member).findOne({
        memberuuid: messageDto.fromMemberUuid,
      });
      const mem = await getRepository(Member).findOne({
        id: messageDto.createdBy,
      });
      if (mem) {
        mesgInfo = await this.messageRepository.find({
          createdBy: mem.id,
          farmId: farms.id,
          isActive: true,
          fromMemberId:memFrom.id
        });
      }
    }
     const farm = await this.farmsService.getFarmByUuid(messageDto.farmId);
      const farmMembers = await this.memberFarmsService.findOne({
        farmId: farm.id,
        memberId: messageDto.createdBy,
      });

      const memberRoleToTheFarm = !farmMembers
      ? 'Breeder'
      : farmMembers && farmMembers.isFamOwner == true
      ? 'FarmOwner'
      : 'FarmMember';
    if (mesgInfo.length === 1) {
      template =
      memberRoleToTheFarm == 'Breeder'
        ? `/new-message-email-from-breeder`
        : `/new-message-email-from-farm`;
      subjectOne =
        memberRoleToTheFarm == 'Breeder'
          ? `You have a new message from a breeder`
          : `You have a new message from a farm`; 
    } else if (
      messageDto.nominationRequestId &&
      messageDto.farmId &&
      messageDto.stallionId &&
      !messageDto.role
    ) {
      let queryBuilder = getRepository(NominationRequest)
        .createQueryBuilder('nr')
        .select(
          'nr.id as id, nr.isCounterOffer as isCounterOffer, nr.isAccepted as isAccepted, nr.isDeclined as isDeclined, nr.mareId as mareId, nr.offerPrice as offerPrice',
        )
        .addSelect(
          'currency.currencyName as currencyName, currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
        )
        .innerJoin('nr.currency', 'currency')
        .andWhere('nr.id = :id', { id: messageDto.nominationRequestId });

      var nominationReqRes = await queryBuilder.getRawOne();

      if (nominationReqRes.mareId) {
        messageDto['mareId'] = nominationReqRes.mareId;
      }
      if (nominationReqRes.offerPrice) {
        messageDto['offerPrice'] = await this.commonUtilsService.insertCommas(nominationReqRes.offerPrice);
      }
      if (nominationReqRes.currencySymbol) {
        messageDto['currencySymbol'] = nominationReqRes.currencySymbol;
      }
     
  
      const stallion = await this.stallionsService.getStallionWithFarm(
        messageDto.stallionId,
      );

      //Nomination Enquiry Sent
      if (
        nominationReqRes.isAccepted == false &&
        nominationReqRes.isDeclined == false &&
        nominationReqRes.isCounterOffer == false
      ) {
        messageTemplateUuid =
          memberRoleToTheFarm == 'Breeder'
            ? notificationTemplates.youHaveNewNominationRequestFarms
            : notificationTemplates.youHaveNewNominationRequestBreeders;

        messageTemplate =
          await this.messageTemplatesService.getMessageTemplateByUuid(
            messageTemplateUuid,
          );
        messageText = messageTemplate.messageText
          .replace('{UserName}', fromMemberName)
          .replace('{message}', messageTextFromMember);
        messageTitle = messageTemplate.messageTitle;

        template = '/farm-nomination-request';
        // template1 = '/breeder-nomination-request';
      }
      // 'Nomination Offer Accepted'
      if (nominationReqRes.isAccepted == true) {
        messageTemplateUuid =
          memberRoleToTheFarm == 'Breeder'
            ? notificationTemplates.nominationRequestAcceptedFarms
            : notificationTemplates.nominationRequestAcceptedBreeders;

        messageTemplate =
          await this.messageTemplatesService.getMessageTemplateByUuid(
            messageTemplateUuid,
          );
        messageText = messageTemplate.messageText
          .replace('{UserName}', fromMemberName)
          .replace(
            '{StallionName}',
            await this.commonUtilsService.toTitleCase(stallion.horseName),
          );
        messageTitle = messageTemplate.messageTitle;
        template1 = '/farm-nomination-request-accepted';
        template = '/breeder-nomination-request-accepted';
      }

      //  'Nomination Offer Declined'
      if (nominationReqRes.isDeclined == true) {
        messageTemplateUuid =
          memberRoleToTheFarm == 'Breeder'
            ? notificationTemplates.nominationRequestRejectedFarms
            : notificationTemplates.nominationRequestRejectedBreeders;
        let messageTemplate =
          await this.messageTemplatesService.getMessageTemplateByUuid(
            messageTemplateUuid,
          );
        const stallion = await this.stallionsService.getStallionWithFarm(
          messageDto.stallionId,
        );
        messageText = messageTemplate.messageText
          .replace('{UserName}', fromMemberName)
          .replace(
            '{StallionName}',
            await this.commonUtilsService.toTitleCase(stallion.horseName),
          );
        messageTitle = messageTemplate.messageTitle;
        template1 = '/farm-nomination-request-rejected';
        template = '/breeder-nomination-request-rejected';
      }

      //'Nomination Counter Offer Made'
      if (
        nominationReqRes.isAccepted == false &&
        nominationReqRes.isDeclined == false &&
        nominationReqRes.isCounterOffer == true
      ) {
        messageTemplateUuid =
          notificationTemplates.nominationRequestCounterOfferBreeders;
        let messageTemplate =
          await this.messageTemplatesService.getMessageTemplateByUuid(
            messageTemplateUuid,
          );
        const stallion = await this.stallionsService.getStallionWithFarm(
          messageDto.stallionId,
        );
        messageText = messageTemplate.messageText
          .replace(
            '{FarmName}',
            await this.commonUtilsService.toTitleCase(farm.farmName),
          )
          .replace(
            '{StallionName}',
            await this.commonUtilsService.toTitleCase(stallion.horseName),
          );
        messageTitle = messageTemplate.messageTitle;
        template = '/breeder-nomination-request-counter-offer';
     //   template1 = '/breeder-nomination-request-counter-offer';
      }
      if (recipientId) {
        if (messageTemplate) {
          if (messageTemplate.emailSms) {
            if (nominationReqRes.isCounterOffer == false) {
              messageDto['createdBy'] = fromUserId;
              messageTitle=subjectTwo?subjectTwo:messageTitle,
              this.sendNotificationMail(
                template1,
                messageTemplateUuid,
                messageTitle,
                messageText,
                preferedNotification?.notificationTypeId,
                fromUserId,
                messageDto,
              );
            }
          }
        }
      }
    }

    const sendNotification = await this.notificationsService.create({
      createdBy: fromUserId,
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: recipientId,
      messageTitle,
      messageText,
      actionUrl: actionUrlValue,
      notificationType: preferedNotification?.notificationTypeId,
      isRead: false,
      farmid: farm.id,
    });

    if (fromUserId) {
      messageDto['createdBy'] = fromUserId;
      if (messageTemplate) {
        if (messageTemplate.emailSms) {
          if (mesgInfo.length === 1) {
            let newMessageDto = { ...messageDto, startConvo: true };
            messageTitle=subjectOne?subjectOne:messageTitle,
            //for from new convo
            this.sendNotificationMail(
              template,
              messageTemplateUuid,
              messageTitle,
              messageText,
              preferedNotification?.notificationTypeId,
              recipientId,
              newMessageDto,
            );
          } else {
            this.sendNotificationMail(
              template,
              messageTemplateUuid,
              messageTitle,
              messageText,
              preferedNotification?.notificationTypeId,
              recipientId,
              messageDto,
            );
          }
        }
      }
    }

    return sendNotification;
  }
  /* Send Email Notification For Registered User */
  async sendNotificationMail(
    template,
    messageTemplateUuid,
    messageTitle,
    messageText,
    notificationTypeId,
    recipientId,
    messageDto,
  ) {
    let stallionName = '';
    let mareInfo = '';
    let broodmareSireInfo = '';
    if (messageDto.stallionId) {
      const stallion = await this.stallionsService.getCompleteStallionInfo(
        messageDto.stallionId,
      );
      stallionName = await this.commonUtilsService.toTitleCase(
        stallion.horseName,
      );
    }

    if (messageDto.mareId) {
      let sireQueryBuilder = getRepository(Horse)
        .createQueryBuilder('sireHorse')
        .select(
          'sireHorse.horseName as sireName, sireHorse.yob as sireYob, sireHorse.id as sireProgenyId',
        )
        .addSelect('sireCountry.countryCode as sireCountryCode')
        .innerJoin('sireHorse.nationality', 'sireCountry')
        .andWhere('sireHorse.horseName IS NOT NULL');

      let queryBuilder = getRepository(Horse)
        .createQueryBuilder('horse')
        .select(
          'horse.horseUuid as horseId, horse.yob as mareYob, horse.horseName as horseName',
        )
        .addSelect('sire.sireName, sire.sireCountryCode, sire.sireYob')
        .addSelect('nationality.countryCode as mareCountryCode')
        .innerJoin('horse.nationality', 'nationality')
        .leftJoin(
          '(' + sireQueryBuilder.getQuery() + ')',
          'sire',
          'sireProgenyId=horse.sireId',
        )
        .andWhere('horse.id = :id', { id: messageDto.mareId });

      const entity = await queryBuilder.getRawOne();
      if (entity) {
        mareInfo =
          (await this.commonUtilsService.toTitleCase(entity.horseName)) +
          ' (' +
          entity.mareYob +
          ', ' +
          entity.mareCountryCode +
          ')';
        broodmareSireInfo =
          (await this.commonUtilsService.toTitleCase(entity.sireName)) +
          ' (' +
          entity.sireYob +
          ', ' +
          entity.sireCountryCode +
          ')';
      }
    }

    const recipient = await getRepository(Member).findOne({ id: recipientId });
    const fromUser = await this.membersService.findOne({
      id: messageDto.createdBy,
    });
    console.log('==============fromUser', fromUser);
    const members = await this.membersService.findOne({
      memberuuid: messageDto.fromMemberUuid,
    });
    let location = '';
    const queryBuilder = getRepository(Farm)
      .createQueryBuilder('fm')
      .select('fm.farmName as farmName,member.fullName as memberName')
      .innerJoin('fm.memberfarms', 'memberfarms')
      .innerJoin('memberfarms.member', 'member')
      .andWhere('fm.farmUuid = :farmUuid', { farmUuid: messageDto.farmId });

    const farm = await queryBuilder.getRawOne();

    // if (farm) {
    if (fromUser['memberaddress'].length) {
      let loc: any = fromUser['memberaddress'][0];
      if (loc && loc.stateName) location = loc.stateName + ', ';
      if (loc && loc.countryName) location = location + loc.countryName;
      //    }
      let profilePicData =
        await this.membersService.getMemberProfileImage();
      let memberprofileimage;
      if (profilePicData) {
        memberprofileimage = profilePicData.profilePic;
      }

      const preferedNotification =
        await this.preferedNotificationService.getPreferredNotification(
          notificationTypeId,
          recipientId,
        );
      if (
        messageTemplateUuid == notificationTemplates.youHaveNewMessage &&
        !messageDto.startConvo == true
      ) {
        template = '/new-message-reply';
      }

      if (template) {
        if (!preferedNotification || preferedNotification.isActive) {
          let origin = messageDto.subject.replace('Enquiry', 'Page');
          let mailData = {
            to: recipient.email,
            subject: messageTitle,
            text: '',
            template: template,
            context: {
              fullName: await this.commonUtilsService.toTitleCase(
                members.fullName,
              ),
              senderName: await this.commonUtilsService.toTitleCase(
                fromUser?.fullName,
              ),
              fromUserName: await this.commonUtilsService.toTitleCase(
                recipient?.fullName,
              ),
              farmUserName: await this.commonUtilsService.toTitleCase(
                farm?.memberName,
              ),
              fromFarmName: await this.commonUtilsService.toTitleCase(
                farm?.farmName,
              ),
              message: messageDto.message,
              location: location,
              profilePic: memberprofileimage,
              origin: origin,
              stallionName: stallionName,
              mareInfo: mareInfo,
              broodmareSireInfo: broodmareSireInfo,
              offerPrice: messageDto.currencySymbol + await this.commonUtilsService.insertCommas(messageDto.offerPrice),
              time: this.formatAMPM(new Date()),
              replyNow:
                process.env.FRONTEND_DOMAIN +
                '/' +
                process.env.FRONTEND_APP_MESSAGES_THREAD_URI +
                messageDto.channelId,
            },
          };
          this.mailService.sendMailCommon(mailData);
        }
      }
    }
  }
  /* Send Notification For Unregistered User */
  async sendNotificationUnregistered(
    messageDto,
    recipientId,
    fullName,
    fromUserId,
  ) {
    let messageTemplateUuid = notificationTemplates.youHaveNewMessage;
    let template;
    let template1;
    let fromMemberName = await this.commonUtilsService.toTitleCase(fullName);
    let messageTextFromMember = messageDto.message;
    let messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        messageTemplateUuid,
      );
    let messageText = messageTemplate.messageText
      .replace('{UserName}', fromMemberName)
      .replace('{message}', messageTextFromMember);
    let messageTitle = messageTemplate.messageTitle;
    let actionUrlValue = messageTemplate.linkAction
      .replace('{channelId}', messageDto.channelId)
      .toString()
      .trim();
    const farm = await this.farmsService.getFarmByUuid(messageDto.farmId);
    let mesgInfo = [];
    if (messageDto.email) {
      //sent msg by
      mesgInfo = await this.messageRepository.find({
        email: messageDto.email,
        farmId: farm.id,
        isActive: true,
      });
    }
    if (mesgInfo.length === 1) {
      template = '/new-message-email-from-breeder';
      messageTitle='You have a new message from a breeder'
      template1 = '/new-message-email-from-farm';
    }
    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.MESSAGING,
      );
    const sendNotification = await this.notificationsService.create({
      createdBy: null,
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: recipientId,
      messageTitle,
      messageText,
      actionUrl: actionUrlValue,
      notificationType: preferedNotification?.notificationTypeId,
      isRead: false,
      farmid: farm.id,
    });

    if (recipientId) {
      if (messageTemplate) {
        if (messageTemplate.emailSms) {
          if (mesgInfo.length === 1) {
            let newMessageDto = { ...messageDto, startConvo: true };
            //for from new convo
            this.sendNotificationMailUnregistered(
              template,
              messageTemplateUuid,
              messageTitle,
              messageText,
              preferedNotification?.notificationTypeId,
              recipientId,
              newMessageDto,
            );
          } else {
            this.sendNotificationMailUnregistered(
              template,
              messageTemplateUuid,
              messageTitle,
              messageText,
              preferedNotification?.notificationTypeId,
              recipientId,
              messageDto,
            );
          }
        }
      }
    } else {
      this.sendNotificationMailUnregistered(
        template,
        messageTemplateUuid,
        messageTitle,
        messageText,
        preferedNotification?.notificationTypeId,
        null,
        messageDto,
      );
    }

    return sendNotification;
  }
  /* Send Email Notification For Unregistered User */
  async sendNotificationMailUnregistered(
    template,
    messageTemplateUuid,
    messageTitle,
    messageText,
    notificationTypeId,
    recipientId,
    messageDto,
  ) {
    let stallionName = '';
    if (messageDto.stallionId) {
      const stallion = await this.stallionsService.getCompleteStallionInfo(
        messageDto.stallionId,
      );
      stallionName = await this.commonUtilsService.toTitleCase(
        stallion.horseName,
      );
    }
    if (recipientId) {
      var recipient = await getRepository(Member).findOne({ id: recipientId });
    }
    let location = '';
    const queryBuilder = getRepository(Farm)
      .createQueryBuilder('fm')
      .select('fm.farmName as farmName,member.fullName as memberName')
      .innerJoin('fm.memberfarms', 'memberfarms')
      .innerJoin('memberfarms.member', 'member')
      .andWhere('fm.farmUuid = :farmUuid', { farmUuid: messageDto.farmId });

    const farm = await queryBuilder.getRawOne();

    if (farm) {
      // if(members['memberaddress'].length){
      //   let loc:any = members['memberaddress'][0];
      //   if(loc && loc.stateName) location = loc.stateName + ', '
      //   if(loc && loc.countryName) location =  location + loc.countryName
      // }
      if (recipientId) {
        var preferedNotification =
          await this.preferedNotificationService.getPreferredNotification(
            notificationTypeId,
            recipientId,
          );
      } else {
        var unregisterCondition = 'Unregister';
      }
      if (
        messageTemplateUuid == notificationTemplates.youHaveNewMessage &&
        !messageDto.startConvo == true
      ) {
        template = '/new-message-reply';
        messageTitle='New Message - replying'
      }
      if (
        !preferedNotification ||
        preferedNotification.isActive ||
        unregisterCondition == 'Unregister'
      ) {
        let origin = messageDto.subject.replace('Enquiry', 'Page');
        let mailData = {
          to: recipientId ? recipient.email : messageDto.fromEmail,
          subject: messageTitle,
          text: '',
          template: template,
          context: {
            fullName: await this.commonUtilsService.toTitleCase(
              messageDto.fromName,
            ),
            senderName: await this.commonUtilsService.toTitleCase(
              messageDto.fullName,
            ),
            user: await this.commonUtilsService.toTitleCase(
              recipientId ? recipient.fullName : messageDto.fromName,
            ),
            farmUserName: await this.commonUtilsService.toTitleCase(
              farm.memberName,
            ),
            fromFarmName: await this.commonUtilsService.toTitleCase(
              farm.farmName,
            ),
            message: messageDto.message,
            location: location,
            origin: origin,
            stallionName: await this.commonUtilsService.toTitleCase(
              stallionName,
            ),
            time: this.formatAMPM(new Date()),
            replyNow:
              process.env.FRONTEND_DOMAIN +
              '/' +
              process.env.FRONTEND_APP_MESSAGES_THREAD_URI +
              messageDto.channelId +
              '/anonymousUser',
          },
        };

        this.mailService.sendMailCommon(mailData);
      }
    }
  }
  /* Get Nomination Requests */
  findRequestedIds(fields) {
    return this.messageRepository.find({
      select: ['nominationRequestId'],
      where: fields,
    });
  }
  /* Message Update - Mark As Read */
  async readMsgs(channelId: string) {
    const member = this.request.user;
    const msgChannelRes = await this.messageChannelService.findWhere({
      channelUuid: channelId,
    });
    if (!(msgChannelRes.length > 0)) {
      throw new NotFoundException('Not found!');
    }
    const response = await this.messageRecipientsService.update(
      { recipientEmail: member['email'], channelId: msgChannelRes[0].id },
      { isRead: true },
    );
    return response;
  }
  /* Get All Messages - Enquired Farms */
  async getEnquiredFarms(): Promise<EnquiredFarmMessagesResponseDto[]> {
    const member = this.request.user;
    let queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .select(
        'DISTINCT farm.farmUuid as farmUuid, farm.farmName as farmName, CASE WHEN (memberfarms.isFamOwner=1 OR memberfarms.isFamOwner=0) THEN 1 ELSE 0 END as isFarmMember',
      )
      .innerJoin(
        'message.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .leftJoin(
        'farm.memberfarms',
        'memberfarms',
        'memberfarms.farmId=farm.id AND memberfarms.memberId=' + member['id'],
      )
      .andWhere('message.email = :email', { email: member['email'] })
      .andWhere('message.isActive = 1')
      .groupBy('farm.farmUuid, farm.farmName, memberfarms.isFamOwner');

    const entities = await queryBuilder.getRawMany();

    return entities;
  }
  /* Remove message */
  async remove(deleteMessageDto: DeleteMessageDto) {
    const member = this.request.user;
    const msgChannelRes = await this.messageChannelService.findWhere({
      channelUuid: deleteMessageDto.channelId,
    });
    if (!(msgChannelRes.length > 0)) {
      throw new NotFoundException('Not found!');
    }
    const msgIds = await this.messageRecipientsService.findResult({
      channelId: msgChannelRes[0].id,
    });
    await this.messageChannelService.update(
      { id: msgChannelRes[0].id },
      { isActive: 0 },
    );
    await this.messageRecipientsService.update(
      { channelId: msgChannelRes[0].id },
      { isRead: true },
    );
    msgIds.forEach(async (obj) => {
      const response = await this.messageRepository.update(
        { id: obj.messageId },
        { isActive: false, modifiedBy: member['id'] },
      );
      //Removing Message Media
      await this.messageRepository.manager.query(
        `EXEC procRemoveMessageMedia 
                       @messageId=@0,
                       @memberId=@1`,
        [obj.messageId, member['id']],
      );
    });
    return `Conversation Removed Successfully`;
  }
  /* Get Member Message Channel By RecieverId */
  async getChannel(channelDto: ChannelDto) {
    const member = this.request.user;
    const farm = await this.farmsService.findOne({ farmUuid: channelDto.rxId });
    if (!farm) {
      throw new NotFoundException('Farm not exist!');
    }
    const result = await this.messageChannelService.findOne({
      txId: member['id'], //Replace email with Id
      rxId: farm.id,
      isActive: 1,
    });
    return result[0];
  }
  /* Get Channel info - By ChannelId */
  async getChannelInfo(channelId) {
    const result = await this.messageChannelService.findByFields({
      channelUuid: channelId,
    });
    return result[0];
  }
  /* Update channel */
  async updateMessage(updateDto: UpdateMessageDto) {
    const msgChannelRes = await this.messageChannelService.findWhere({
      channelUuid: updateDto.channelId,
    });
    if (!(msgChannelRes.length > 0)) {
      throw new NotFoundException('Not found!');
    }
    let messageChannel;
    //1:TOS Warning
    if (updateDto.status == 3) {
      messageChannel = await this.messageChannelService.update(
        { id: msgChannelRes[0].id },
        { isFlagged: false },
      );
    }
    if (messageChannel && messageChannel.affected) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Updated Successfully',
      };
    } else {
      return {
        statusCode: HttpStatus.NOT_MODIFIED,
        message: 'Not Updated',
      };
    }
  }
  /* Get Member Message Channel By RecieverId */
  async checkChannel(createChannelDto: CreateChannelPayloadDto) {
    const farm = await this.farmsService.findOne({
      farmUuid: createChannelDto.rxId,
    });
    if (!farm) {
      throw new NotFoundException('Farm not exist!');
    }
    const tx = await getRepository(Member).findOne({
      email: createChannelDto.txEmail,
    });
    if (!tx) {
      throw new NotFoundException('Member not exist!');
    }
    const result = await this.messageChannelService.findWhere({
      rxId: farm.id,
      txEmail: tx.email,
      isActive: 1,
    });
    if (result.length > 0) {
      return result[0];
    } else {
      const member = this.request.user;
      const memberInfos = await this.memberFarmsService.findOne({
        memberId: member['id'],
        farmId: farm.id,
      });
      if (!memberInfos) {
        throw new NotFoundException(
          `You don't have permissions to send message`,
        );
      }
      let channelId = uuidv4().toLocaleUpperCase();
      await this.messageChannelService.create({
        channelUuid: channelId,
        txEmail: tx.email,
        rxId: farm.id,
        isActive: true,
        txId: member['id'],
      });

      let messageDto = new CreateMessageDto();

      (messageDto.message = ' '),
        (messageDto.farmId = createChannelDto.rxId),
        (messageDto.stallionId = createChannelDto.stallionId),
        (messageDto.subject = 'Report Enquiry'),
        (messageDto.channelId = channelId),
        (messageDto.fromMemberUuid = tx.memberuuid),
        await this.create(messageDto);

      const result = await this.messageChannelService.findWhere({
        rxId: farm.id,
        txEmail: tx.email,
        isActive: 1,
      });

      return result[0];
    }
  }
  /* Get  Message  BY ChannelId And RecieverId */
  async getMessageByChannelIdAndRecipient(
    channelId: number,
    recipientId: number,
    senderId: number,
  ) {
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .select(
        'message.id as messageId, message.message as message, message.subject as subject, message.fromMemberId as fromMemberId, message.createdBy as memberId',
      )
      .addSelect(
        'messagerecipient.channelId as msgChannelId, messagerecipient.recipientId as msgrecipientId',
      )
      .innerJoin('message.messagerecipient', 'messagerecipient') //provided leftJoin to get broadcast messages too
      .andWhere('messagerecipient.channelId = :channelId', { channelId })
      .andWhere('messagerecipient.recipientId = :recipientId', { recipientId })
      .andWhere('message.createdBy = :senderId', { senderId });

    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /* Restore message */
  async restore(channelId: string) {
    const member = this.request.user;
    const msgChannelRes = await this.messageChannelService.findWhere({
      channelUuid: channelId,
    });
    if (!(msgChannelRes.length > 0)) {
      throw new NotFoundException('Not found!');
    }
    const msgIds = await this.messageRecipientsService.findResult({
      channelId: msgChannelRes[0].id,
    });
    const updt = await this.messageChannelService.update(
      { id: msgChannelRes[0].id },
      { isActive: true },
    );
    const msgChannelRessss = await this.messageChannelService.findWhere({
      channelUuid: channelId,
    });
    msgIds.forEach(async (obj) => {
      const response = await this.messageRepository.update(
        { id: obj.messageId },
        { isActive: true, modifiedBy: member['id'] },
      );
      //Restore Message Media
      await this.messageRepository.manager.query(
        `EXEC procRestoreMessageMedia 
                       @messageId=@0,
                       @memberId=@1`,
        [obj.messageId, member['id']],
      );
    });
    return `Conversation Restored Successfully`;
  }

  /* Add member to channel */
  async addMemberToChannel(channelId: string) {
    const member = this.request.user;
    const msgChannelRes = await this.messageChannelService.findWhere({
      channelUuid: channelId,
    });
    if (member['email'] !== msgChannelRes[0].txEmail) {
      throw new NotFoundException('Email not matched with Channel!');
    }
    if (!(msgChannelRes.length > 0)) {
      throw new NotFoundException('Channel Not found!');
    }
    let messageChannel;

    messageChannel = await this.messageChannelService.update(
      { id: msgChannelRes[0].id },
      { txId: member['id'] },
    );

    if (messageChannel && messageChannel.affected) {
      const messageRecipientUpdate = await this.messageRecipientsService.update(
        {
          channelId: msgChannelRes[0].id,
          recipientEmail: msgChannelRes[0].txEmail,
          recipientId: null,
        },
        { recipientId: member['id'] },
      );
    }

    return {
      channelId,
    };
  }

  async getMessageMedia(mediaId: string) {
    const member = this.request.user;
    let fileData = await this.messageRepository.manager.query(
      `EXEC procGetSMPMessageMediaByMediaIdAndRecipientId 
      @messageMediaId=@0,
      @recipientId=@1`,
      [mediaId, member['id']],
    );
    if (!fileData.length) {
      throw new ForbiddenException(
        'You are not authorized to view this content!',
      );
    }
    const s3Object = await this.fileUploadsService.getS3FileObject(
      fileData[0].mediaLocation,
    );
    return {
      s3Object,
      fileData: fileData[0],
    };
  }
}
