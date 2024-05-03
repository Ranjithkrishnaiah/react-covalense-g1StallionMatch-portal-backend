import {
  Injectable,
  Inject,
  Scope,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { CreateStallionPromotionDto } from './dto/create-stallion-promotion.dto';
import { StopStallionPromotionDto } from './dto/stop-promotion.dto';
import { StallionPromotion } from './entities/stallion-promotion.entity';
import { StallionsService } from 'src/stallions/stallions.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Member } from 'src/members/entities/member.entity';
import { PreferedNotificationService } from 'src/prefered-notifications/prefered-notifications.service';
import { MailService } from 'src/mail/mail.service';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { AuditService } from 'src/audit/audit.service';
import { ProductsService } from 'src/products/products.service';
import { PRODUCTCODES } from 'src/utils/constants/products';
import { BoostProfileService } from 'src/boost-profile/boost-profile.service';
import {
  notificationTemplates,
  notificationType,
} from 'src/utils/constants/notifications';
import { MembersService } from 'src/members/members.service';
import { StallionPromotionArchive } from './entities/stallion-promotion-archive.entity';
import { ReportProductItem } from 'src/report-product-items/entities/report-product-item.entity';
import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { format } from 'date-fns';



@Injectable({ scope: Scope.REQUEST })
export class StallionPromotionService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(StallionPromotion)
    private stallionPromotionRepository: Repository<StallionPromotion>,
    private stallionsService: StallionsService,
    private messageTemplatesService: MessageTemplatesService,
    private notificationsService: NotificationsService,
    private preferedNotificationService: PreferedNotificationService,
    private mailService: MailService,
    private commonUtilsService: CommonUtilsService,
    private auditService: AuditService,
    private productService: ProductsService,
    private boostProfileService: BoostProfileService,
    private membersService: MembersService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createStallionPromotionDto: CreateStallionPromotionDto) {
    const member = this.request.user;
    const { stallionId, startDate } = createStallionPromotionDto;
    let stallion = await this.stallionsService.findOne(stallionId);
    if (!stallion) {
      throw new HttpException('Stallion not found', HttpStatus.NOT_FOUND);
    }
    const stallionPromotion = await this.findByStallionId(stallion.id);
    // var yesterday = new Date(today.getTime() - (24*60*60*1000));
    var endDate = new Date(startDate);

    endDate.setFullYear(endDate.getFullYear() + 1);
    endDate = new Date(new Date(endDate).getTime() - 24 * 60 * 60 * 1000);
    let result;
    if (stallionPromotion.length > 0) {
      let newDateFormat = new Date(startDate).toLocaleDateString();
      let startDateFormat = new Date(
        stallionPromotion[0].stallionPromotion_startDate,
      ).toLocaleDateString();
      if (newDateFormat == startDateFormat) {
        throw new HttpException(
          'Stallion already Promoted during this period.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      let updateStallionDto = {};
      if (startDateFormat >= new Date().toLocaleDateString()) {
        updateStallionDto = {
          startDate: startDate,
          modifiedBy: member['id'],
          endDate: endDate,
          expiryDate: endDate,
          promotedCount: parseInt(
            stallionPromotion[0].stallionPromotion_promotedCount + 1,
          ),
        };
      } else {       
        updateStallionDto = {        
          startDate: startDate,
          modifiedBy: member['id'],
          endDate: stallionPromotion[0].stallionPromotion_expiryDate
            ? new Date(
                stallionPromotion[0].stallionPromotion_expiryDate,
              )
            : endDate,
          promotedCount: parseInt(
            stallionPromotion[0].stallionPromotion_promotedCount + 1,
          ),
        };
      }

      result = await this.updateStallionPromotion(
        stallionPromotion[0].stallionPromotion_id,
        updateStallionDto,
      );
      result.promotionUuid =
        stallionPromotion[0].stallionPromotion_promotionUuid;
   //   this.notifyAfterPromotion(member, stallionId, endDate);

      this.boostProfileService.sendBoostNotificationWhenStallionPromotes({
        promotionId: stallionPromotion[0].stallionPromotion_id,
        createdBy: member['id'],
      });
    } else {
      const createDto = {
        ...createStallionPromotionDto,
        stallionId: stallion.id,
        createdBy: member['id'],
        endDate: endDate,
        expiryDate: endDate,
      };
      result = await this.stallionPromotionRepository.save(
        this.stallionPromotionRepository.create(createDto),
      );
      this.boostProfileService.sendBoostNotificationWhenStallionPromotes({
        promotionId: result.id,
        createdBy: member['id'],
      });
     // this.notifyAfterPromotion(member, stallionId, endDate);
    }
    return result;
  }

  async findAll() {
    const queryBuilder =
      this.stallionPromotionRepository.createQueryBuilder('stallionPromotion');
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  async findOne(entity) {
    const record = await this.stallionPromotionRepository.find({
      where: entity,
    });
    if (!record) {
      throw new UnprocessableEntityException('Record not exist!');
    }
    return record;
  }

  async findByStallionId(stallionId: number) {
    const queryBuilder = this.stallionPromotionRepository
      .createQueryBuilder('stallionPromotion')
      .andWhere('stallionPromotion.stallionId = :stallionId', {
        stallionId: stallionId,
      });
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  async stopPromotion(id: string, stopPromotionDto: StopStallionPromotionDto) {
    const { effectiveDate } = stopPromotionDto;

    let stallionRecord = await this.stallionsService.getStallionByUuid(id);

    if (!stallionRecord) {
      throw new UnprocessableEntityException('Stallion not exist!');
    }
    const member = this.request.user;
    const latestPromotionRecoed = await this.findOne({
      stallionId: stallionRecord.id,
    });
    let updateStallionDto = {
      endDate: new Date(effectiveDate),
      modifiedBy: member['id'],
    };
    const response = await this.updateStallionPromotion(
      latestPromotionRecoed[0].id,
      updateStallionDto,
    );

    return { statusCode: 200, message: 'Stoped Promotion', data: response };
  }

  async getLatestStallionPromotion(stallionId: number) {
    let queryBuilder = await this.stallionPromotionRepository
      .createQueryBuilder('stallionPromotion')
      .andWhere('stallionId = :stallionId', { stallionId: stallionId })
      .orderBy('id', 'DESC')
      .limit(1);
    const itemCount = await queryBuilder.getCount();
    if (!itemCount) {
      throw new NotFoundException(
        'No promotion records found to this stallion!',
      );
    }
    return await queryBuilder.getRawOne();
  }

  async updateStallionPromotion(id: number, updateStallionPromotion) {
    return this.stallionPromotionRepository.update(
      { id: id },
      updateStallionPromotion,
    );
  }

  //Auto Renew
  async updatePromotion(updatePromotionDto: UpdatePromotionDto) {
    const { stallionId } = updatePromotionDto;
    const member = this.request.user;
    const stallionRecord = await this.stallionsService.findOne(stallionId);
    if (!stallionRecord) {
      throw new NotFoundException('No stallion record found with this Id!');
    }
    const promotionRecord = await this.findOne({
      stallionId: stallionRecord.id,
    });
    if (!promotionRecord) {
      throw new NotFoundException('No promotion record found with this Id!');
    }
    //Note:needs to throw error if isPromoted not true
    const response = await this.updateStallionPromotion(promotionRecord[0].id, {
      isAutoRenew: !promotionRecord[0].isAutoRenew,
      modifiedBy: member['id'],
    });

    return response;
  }

  /* needs to remove after replacing from front-end*/
  async stopPromotionById(
    id: number,
    stopPromotionDto: StopStallionPromotionDto,
  ) {
    const { effectiveDate } = stopPromotionDto;

    const member = this.request.user;

    let updateStallionDto = {
      endDate: new Date(effectiveDate),
      modifiedBy: member['id'],
    };
    const response = await this.updateStallionPromotion(id, updateStallionDto);

    return { statusCode: 200, message: 'Stoped Promotion', data: response };
  }

  /* Stop promotion of stallion */
  async stopPromotionByStallionId(stopPromotionDto: StopStallionPromotionDto) {
    const { effectiveDate, stallionId } = stopPromotionDto;
    const member = this.request.user;
    const stallionRecord = await this.stallionsService.findOne(stallionId);
    if (!stallionRecord) {
      throw new NotFoundException('No stallion record found with this Id!');
    }
    const promotionRecord = await this.findOne({
      stallionId: stallionRecord.id,
    });
    if (!promotionRecord) {
      throw new NotFoundException('No promotion record found with this Id!');
    }
    let updateStallionDto = {
      endDate: new Date(effectiveDate),
      modifiedBy: member['id'],
      stopPromotionCount: promotionRecord[0].stopPromotionCount + 1,
    };
    await this.sendNotification({
      recipientId: member['id'],
      createdBy: member['id'],
      stallionId: stallionId,
      effectiveDate: effectiveDate,
    });
    const response = await this.updateStallionPromotion(
      promotionRecord[0].id,
      updateStallionDto,
    );
    return { statusCode: 200, message: 'Stoped Promotion', data: response };
  }
  /* Manual stopped Promotion Will Considered as Brand New Promotion -Promotion must follow the 'Add to cart' model of payment. */
  async stopPromotionManuallyByStallionId(stopPromotionDto: StopStallionPromotionDto){
    const member = this.request.user;
    const queryBuilder = await getRepository(StallionPromotion)
    .createQueryBuilder('stallionPromotion')
    .select('stallionPromotion.id  as promotionId, stallionPromotion.startDate as startDate,stallionPromotion.endDate as endDate,stallionPromotion.stallionId as stallionId,stallionPromotion.createdBy as createdBy')
    .innerJoin('stallionPromotion.stallion', 'stallion')
    .andWhere('stallion.stallionUuid = :stallionUuid', {
      stallionUuid: stopPromotionDto.stallionId,
    });
    const entity = await queryBuilder.getRawOne()
    if (!entity) {
      throw new NotFoundException('No promotion record found with this Id!');
    }
    console.log('entity', entity);
    const promoted = await getRepository(StallionPromotionArchive).save({
      startDate: entity.startDate,
      endDate: entity.endDate,
      stallionId: entity.stallionId,
      createdBy: entity.createdBy,
    });
    console.log('promoted', promoted);
    if (promoted && promoted.id) {
      // await getRepository(ReportProductItem).update({
      //   stallionPromotionId: entity.promotionId
      // },{stallionPromotionId:null});
      await getRepository(OrderProductItem).delete({
        stallionPromotionId: entity.promotionId
      });
      await getRepository(ReportProductItem).delete({
        stallionPromotionId: entity.promotionId
      });
      await getRepository(StallionPromotion).delete({
        id: entity.promotionId,
      });
      await this.sendNotification({
        recipientId: member['id'],
        createdBy: member['id'],
        stallionId: stopPromotionDto.stallionId,
        effectiveDate: stopPromotionDto.effectiveDate,
      });
      const inputDate = new Date(entity.endDate);
          const year = inputDate.getUTCFullYear();
          const month = (inputDate.getUTCMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
          const day = inputDate.getUTCDate().toString().padStart(2, '0');

          const formattedDate = `${year}-${month}-${day}`;
      this.eventEmitter.emit('updateStallionStopPromotion', {
        key: 'endDate',
        oldValue: formattedDate,
        newValue: stopPromotionDto.effectiveDate,
      });
      return { statusCode: 200, message: 'Stopped Promotion' };
    }

  }

  /* Send notification after stop stallion Promotion*/
  async sendNotification(stopPromotionData) {
    const { recipientId, stallionId, effectiveDate, createdBy } =
      stopPromotionData;
    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stallionId, horse.horseName as horseName')
      .addSelect('farm.farmUuid as farmId, farm.farmName as farmName')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('stallion.farm', 'farm')
      .andWhere('stallion.stallionUuid = :stallionUuid', {
        stallionUuid: stallionId,
      });

    const stallion = await queryBuilder.getRawOne();

    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        notificationTemplates.stopPromotingStallion,
      );
    const messageText = messageTemplate.messageText.replace(
      '{StallionName}',
      await this.commonUtilsService.toTitleCase(stallion.horseName),
    );
    const messageTitle = messageTemplate.messageTitle;
    let actionUrlValue = messageTemplate.linkAction
      .replace('{farmName}', stallion.farmName)
      .replace('{farmId}', stallion.farmId)
      .toString()
      .trim();
    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.PROMOTIONAL,
        recipientId,
      );

    this.notificationsService.create({
      createdBy: createdBy,
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: recipientId,
      messageTitle,
      messageText,
      isRead: false,
      notificationType: preferedNotification?.notificationTypeId,
      actionUrl: actionUrlValue,
    });

    if (messageTemplate) {
      if (messageTemplate.emailSms) {
        const recipient = await getRepository(Member).findOne({
          id: recipientId,
        });

        if (!preferedNotification || preferedNotification.isActive) {
          let effectiveDateArr = effectiveDate.split('-');
          let mailData = {
            to: recipient.email,
            subject: `Your stallion is no longer being promoted on stallionmatch.com`,
            text: '',
            template: '/stop-promoting',
            context: {
              stallionName: await this.commonUtilsService.toTitleCase(
                stallion.horseName,
              ),
              rosterUrl:
                process.env.FRONTEND_DOMAIN +
                '/stallion-roster/' +
                stallion.farmName +
                '/' +
                stallion.farmId,
              effectiveDate:
                effectiveDateArr[2] +
                '.' +
                effectiveDateArr[1] +
                '.' +
                effectiveDateArr[0],
                farmUrl:
                process.env.FRONTEND_DOMAIN +
                '/' +
                'stud-farm' +
                '/'+
                stallion.farmName +
                '/' +
                stallion.farmId,
            },
          };

          this.mailService.sendMailCommon(mailData);
        }
      }
    }
  }

  /* Send notification after stallion Promotion */
  async notifyAfterPromotion(member, stallionId, endDate,price,currency) {
    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stallionId, horse.horseName as horseName')
      .addSelect('farm.farmUuid as farmId, farm.farmName as farmName')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('stallion.farm', 'farm')
      .andWhere('stallion.stallionUuid = :stallionUuid', {
        stallionUuid: stallionId,
      });

    const stallion = await queryBuilder.getRawOne();
    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        notificationTemplates.renewedStallionPromotedConfirmation,
      );
    const messageText = messageTemplate.messageText.replace(
      '{StallionName}',
      await this.commonUtilsService.toTitleCase(stallion.horseName),
    );
    const messageTitle = messageTemplate.messageTitle;
    let actionUrlValue = messageTemplate.linkAction
      .replace('{farmName}', stallion.farmName)
      .replace('{farmId}', stallion.farmId)
      .toString()
      .trim();
    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.PROMOTIONAL,
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
      actionUrl: actionUrlValue,
    });

    if (messageTemplate) {
      if (messageTemplate.emailSms) {
        if (!preferedNotification || preferedNotification.isActive) {
          const productData =
            await this.productService.getProductInfoByProductCode(
              PRODUCTCODES.PROMOTION_STALLION,
            );
          const farmAdmin = await this.membersService.findOneById(member['id']);
          let mailData = {
            to: member['email'],
        //    subject: messageTitle,
            subject: 'Promoted Charge Success',
            text: '',
            template: '/promoted-success',
            context: {
              stallionName: await this.commonUtilsService.toTitleCase(
                stallion.horseName,
              ),
              expiryDate: format(new Date(endDate), 'ddd MMM dd yyyy'),
              promotionFee: currency + ' ' + price,
              farmAdminName: await this.commonUtilsService.toTitleCase(
                farmAdmin?.fullName,
              ),
              viewOrder:
                process.env.FRONTEND_DOMAIN +
                '/' +
                process.env.FRONTEND_APP_MEMBER_PROFILE_URI,
            },
          };

          this.mailService.sendMailCommon(mailData);
        }
      }
    }
  }

  /* To Delete stallion promotion record */
  async delete(entities) {
    const response = await this.stallionPromotionRepository.delete(entities);
    return response;
  }
}
