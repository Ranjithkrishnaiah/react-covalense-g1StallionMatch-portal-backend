import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { format } from 'date-fns';
import { env } from 'process';
import { AdminPageSettings } from 'src/admin-page-settings/entities/admin-page-setting.entity';
import { CartProductItem } from 'src/cart-product-items/entities/cart-product-item.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { Currency } from 'src/currencies/entities/currency.entity';
import { AuditFarm } from 'src/farms/entities/audit-farm.entity';
import { Farm } from 'src/farms/entities/farm.entity';
import { MailService } from 'src/mail/mail.service';
import { MemberAddress } from 'src/member-address/entities/member-address.entity';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { MemberPaytypeAccess } from 'src/member-payment-access/entities/member-paytype-access.entity';
import { MemberProfileImage } from 'src/member-profile-image/entities/member-profile-image.entity';
import { Member } from 'src/members/entities/member.entity';
import { MessageChannel } from 'src/message-channel/entities/message-channel.entity';
import { MessageRecipient } from 'src/message-recepient/entities/message-recipient.entity';
import { MessageTemplate } from 'src/message-templates/entities/message-template.entity';
import { Message } from 'src/messages/entities/messages.entity';
import { NotificationType } from 'src/notification-types/entities/notification-type.entity';
import { Notifications } from 'src/notifications/entities/notifications.entity';
import { OrderProductItemDto } from 'src/order-product-items/dto/create-order-product-item.dto';
import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';
import { OrderProductDto } from 'src/order-product/dto/order-product.dto';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { OrderStatus } from 'src/order-status/entities/order-status.entity';
import { CreateTransactionDto } from 'src/order-transaction/dto/create-transaction.dto';
import { OrderTransaction } from 'src/order-transaction/entities/order-transaction.entity';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { Order } from 'src/orders/entities/order.entity';
import { PageView } from 'src/page-view/entities/page-view.entity';
import { PaymentMethod } from 'src/payment-methods/entities/payment-method.entity';
import { Product } from 'src/products/entities/product.entity';
import { ReportProductItem } from 'src/report-product-items/entities/report-product-item.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { SearchStallionMatch } from 'src/search-stallion-match/entities/search-stallion-match.entity';
import { StallionProfileImage } from 'src/stallion-profile-image/entities/stallion-profile-image.entity';
import { StallionPromotionArchive } from 'src/stallion-promotions/entities/stallion-promotion-archive.entity';
import { StallionPromotion } from 'src/stallion-promotions/entities/stallion-promotion.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { DEFAULT_VALUES, PAYMENT_METHOD, PAYMENT_STATUS, SALES_STATUS } from 'src/utils/constants/common';
import {
  notificationTemplates,
  notificationType,
} from 'src/utils/constants/notifications';
import { ordersStatusList } from 'src/utils/constants/orders-status';
import { PRODUCTCODES } from 'src/utils/constants/products';
import { Brackets, In, UpdateResult, getRepository } from 'typeorm';
const stripe = require('stripe')(
  'sk_test_51KbvAgKW4289ZuyI2TwnLliWoVquBEiDz76T18ny6jX6oI8dGiUDP9TIWIlxGT5PYXLxJhDh1JxqJo68peeEYzcW00d8Vwox4C',
);

//@Injectable({ scope: Scope.DEFAULT })
@Injectable()
export class JobsSchedularService {
  constructor(
    private mailService: MailService,
    private schedulerRegistry: SchedulerRegistry,
    private commonUtilsService: CommonUtilsService,
  ) {}

  //Every Minutes
  @Cron('0 * * * * *', {
    name: 'testing',
  })
  testingCron() {
    console.log('testing!', new Date());
  }
   // At mid Night
  @Cron('0 0 * * *', {
    name: 'Remove-Messages-Permanently',
  })
  async removeMessagesPermanent() {
    console.log('removeMessagesPermanently !', new Date())
    this.removeMessagesPermanently();
  }
  // 0 60 * * * *	every hour, at the start of the 60th minute
  // Every Minutes -abandonedCart - 3hrs
  @Cron('0 * * * * *', {
    name: 'abandonedCart- 3hrs',
  })
  async abandonedCarts() {
    console.log('abandonedCart - 3hrs!', new Date());
    this.abandonedCart(3, 0);
  }
  // Every Minutes -abandonedCart - 24hrs
  @Cron('0 * * * * *', {
    name: 'abandonedCart - 24hrs',
  })
  async abandonedCart24hrs() {
    console.log('abandonedCart - 24hrs!', new Date());
    this.abandonedCart24hr(24, 0);
  }
  // At mid Night -abandonedCart - 3 days
  @Cron('0 * * * * *', {
    name: 'abandonedCart- 3 days',
  })
  async abandonedCart3days() {
    console.log('abandonedCart - 3 days!', new Date());
    this.abandonedCart3day(0, 3);
  }

  // At mid Night
  @Cron('0 0 * * *', {
    name: 'expiryReminder',
  })
  async expiryReminder() {
    console.log('expiryReminder job!');
    this.stallionExpiryReminder(14);
  }

  // At mid Night
  @Cron('0 0 * * *', {
    name: 'autoRenewal',
  })
  async autoRenewal() {
    console.log('autoRenewal job!');
    this.stallionAutoRenewal();
  }

  // At mid Night
  @Cron('0 0 * * *', {
    name: 'movingExpiredPromotions',
  })
  async movingExpiredPromotions() {
    console.log('movingExpiredPromotionsToArchive job!');
    this.movingExpiredPromotionsToArchive();
  }
  // At mid Night
  @Cron('0 0 * * *', {
    name: 'loginReminders',
  })
  async loginReminders() {
    console.log('loginReminders...!');
    this.loginReminder(60);
  }

  // At mid Night
  // @Cron('0 0 * * *', {
  //   name: 'farmAnalyticsReports',
  // })
  // async farmAnalyticsReports() {
  //   console.log('farmAnalyticsReports...!');
  //   this.farmAnalyticsReport(30);
  // }

  @Cron('0 0 * * *', {
    name: 'hotNotification',
  })
  async hotNotification() {
    console.log('hotNotification job!');
    this.stallionHotNotification(5);
  }

  @Cron('0 0 * * *', {
    name: 'renewalReminder',
  })
  async renewalReminder() {
    console.log('renewalReminder job!');
    this.renewalReminderFarms(30);
  }

  @Cron('0 0 * * *', {
    name: 'unusualLogin',
  })
  async unusualLogin() {
    console.log('unusualLogin job!');
    this.renewalReminderFarms(7);
  }

  @Cron('0 */21 * * *', {
    name: 'sendUpdateProfileNotification',
  })
  notify() {
    this.sendUpdateProfileNotification();
  }
  @Cron('0 */21 * * *', {
    name: 'sendStallionHighSearchNotification',
  })
  notifyHighStallionSearch() {
    this.sendStallionHighSearchNotification();
  }

  // Weekly
  @Cron('0 0 * * 0', {
    name: 'weeklyStallionSearch',
  })
  async weeklyStallionSearch() {
    console.log('weeklyStallionSearch job!');
    this.stallionSearchReport(7);
  }

  // Monthly
  @Cron('0 0 1 * *', {
    name: 'monthlyStallionSearch',
  })
  async monthlyStallionSearch() {
    console.log('monthlyStallionSearch job!');
    let date = new Date();
    const days = await this.getDays(date.getFullYear(), date.getMonth() - 1);
    this.stallionSearchReport(days);
  }

  @Cron('0 0 1 * *', {
    name: 'farmAnalytics',
  })
  async farmAnalytics() {
    console.log('farmAnalytics job!');
    let date = new Date();
    const days = await this.getDays(date.getFullYear(), date.getMonth() - 1);
    this.farmAnalyticsReport(days);
  }

  // Monthly or 3 weeks
  // @Cron('0 0 1 * *', {
  //   name: 'monthlyCardExpirySearch',
  // })

  // async monthlyCardExpirySearch() {
  //   console.log('Monthly card expiry job!');
  //   this.cardExpiryNotifications();
  // }

  @Cron('0 0 * * *', {
    name: 'saleStatusUpdate',
  })
  async saleStatusUpdate() {
    console.log('saleStatusUpdate job!');
    this.updateSaleStatus();
  }

  // At mid Night
  @Cron('0 0 * * *', {
    // @Cron('0 * * * * *', {
    name: 'boostConclusion',
  })
  async boostConclusion() {
    console.log('boostConclusion job!');
    this.boostConclusionNotifications();
  }

  async boostConclusionNotifications() {
    let today = new Date();
    const dateBefore = today.setDate(today.getDate() - 1);
    const startDate = await this.setHoursZero(new Date(dateBefore));
    const endDate = await this.setToMidNight(new Date());

    const result = await getRepository(OrderTransaction)
      .createQueryBuilder('ot')
      .select('ot.transactionId transactionId')
      .addSelect('bt.boostTypeName boostType')
      .addSelect('member.fullName fullName, member.email')
      .addSelect('stallion.id stallionId, stallion.stallionUuid')
      .addSelect('horse.horseName stallionName')
      .addSelect('bs.createdBy')
      .innerJoin('ot.orderproduct', 'op')
      .innerJoin('op.orderProductItem', 'opi')
      .innerJoin('opi.boostprofile', 'bp')
      .innerJoin('bp.booststallion', 'bs')
      .innerJoin('bp.boosttype', 'bt')
      .innerJoin('bs.stallion', 'stallion')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('bs.member', 'member')
      .andWhere('ot.createdOn >= :startDate AND ot.createdOn <= :endDate', {
        startDate,
        endDate,
      })
      .andWhere('op.productId IN (7,8)')
      .andWhere('opi.boostProfileId IS NOT NULL')
      .andWhere('ot.paymentStatus IN (2)')
      .getRawMany();

    for (const item of result) {
      this.sendBoostConclusionMail(item);
    }
  }

  async sendBoostConclusionMail(data) {
    let stallionProfileViews = await getRepository(PageView)
      .createQueryBuilder('pageView')
      .andWhere(
        "pageView.entityType = 'STALLION' AND pageView.entityId = :stallionId",
        { stallionId: data.stallionId },
      )
      .getCount();

    let messages = await getRepository(Notifications)
      .createQueryBuilder('notifications')
      .select(
        'COUNT(notifications.id) as messageCount, SUM(CASE WHEN notifications.isRead=1 THEN 1 ELSE 0 END) as msgReadCount',
      )
      .andWhere('notifications.createdBy = :createdBy', {
        createdBy: data.createdBy,
      })
      .andWhere('notifications.messageTemplateId IN (36)')
      .getRawOne();

    console.log('result', data);
    let mailData = {
      to: data.email,
      subject: 'Boost conclusion email',
      text: '',
      template: '/boost-conclusion',
      context: {
        boostName: this.toTitleCase(data.boostType),
        stallionName: data?.stallionName,
        breedersReached: messages?.messageCount,
        messageOpens: messages?.msgReadCount,
        messageClicks: messages?.msgReadCount,
        stallionProfileViews: stallionProfileViews,
        replies: 0,
        replyNow:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_MESSAGES_THREAD_URI,
      },
    };
    console.log('=== sendExpiryRemiderMail mailData', mailData);

    this.mailService.sendMailCommon(mailData);
  }

  async stallionExpiryReminder(days: number) {
    console.log('stallionExpiryReminder job!');
    let today = new Date();
    const dateAfter = today.setDate(today.getDate() + days);
    const startDate = await this.setHoursZero(new Date(dateAfter));
    const endDate = await this.setToMidNight(new Date(dateAfter));

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    const queryBuilder = getRepository(StallionPromotion)
      .createQueryBuilder('stallionPromotion')
      .select(
        'stallionPromotion.id as promotionId, stallionPromotion.startDate as startDate, stallionPromotion.endDate as endDate',
      )
      .addSelect(
        'stallion.stallionUuid as stallionId, stallion.horseId as horseId, stallion.createdBy as createdBy',
      )
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN stallionPromotion.startDate AND stallionPromotion.endDate) AND (op.promotionId IS NOT NULL OR stallionPromotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .addSelect('horse.horseName as horseName')
      .addSelect('stallionservicefee.fee as fee')
      .addSelect(
        'currency.currencyName as currencyName, currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect('farm.farmUuid as farmId, farm.farmName as farmName')
      .innerJoin('stallionPromotion.stallion', 'stallion')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('stallion.stallionservicefee', 'stallionservicefee')
      .innerJoin('stallionservicefee.currency', 'currency')
      .innerJoin('stallion.farm', 'farm')
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=stallionPromotion.id',
      )
      .andWhere(
        'stallionPromotion.endDate >= :fromDate AND stallionPromotion.endDate <= :endDate',
        {
          fromDate: new Date(startDate),
          endDate: endDate,
        },
      );

    const entities = await queryBuilder.getRawMany();
    // console.log('=======================',entities);
    for (const entity of entities) {
      const recipient = await getRepository(Member).findOne({
        id: entity.createdBy,
      });
      if (recipient) {
        this.sendSallionExpiryRemiderMail(entity, recipient);
      }
    }
  }

  async sendSallionExpiryRemiderMail(notificationAndMailData, recipient) {
    const messageTemplate = await this.getMessageTemplateByUuid(
      notificationTemplates.stallionExpiryReminderFarms,
    );
    if (messageTemplate) {
      const messageText = messageTemplate.messageText
        .replace(
          '{StallionName}',
          await this.toTitleCase(notificationAndMailData.horseName),
        )
        .replace(
          '{date}',
          await this.dateFormate(notificationAndMailData.endDate),
        );
      const messageTitle = messageTemplate.messageTitle;
      const actionUrl = messageTemplate.linkAction
        .replace('{farmName}', notificationAndMailData.farmName)
        .replace('{farmId}', notificationAndMailData.farmId);
      const preferedNotification =
        await this.getPreferredNotificationByNotificationTypeCode(
          notificationType.PROMOTIONAL,
          recipient.id,
        );

      const createNotification = {
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: recipient.id,
        messageTitle,
        messageText,
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
        actionUrl,
      };
      const notificationCreated = await getRepository(Notifications).save(
        createNotification,
      );

      if (messageTemplate.emailSms) {
        if (!preferedNotification || preferedNotification.isActive) {
          this.sendExpiryRemiderMail(notificationAndMailData, recipient);
        }
      }
    }
  }

  async sendExpiryRemiderMail(data, recipient) {
    let mailData = {
      to: recipient.email,
      subject: 'Expiry Reminder',
      text: '',
      template: '/expiry-reminder',
      context: {
        farmAdminName: await this.toTitleCase(recipient.fullName),
        stallionName: await this.toTitleCase(data.horseName),
        expiryDate: await this.dateFormate(data.endDate),
        fee: data.currencyCode + ' ' + data.fee,
        renewNow:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_STALLION_ROSTER_URI +
          data.farmName +
          '/' +
          data.farmId,
        autoRenewOn:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_STALLION_ROSTER_URI +
          data.farmName +
          '/' +
          data.farmId,
      },
    };
    console.log('=== sendExpiryRemiderMail mailData', mailData);

    this.mailService.sendMailCommon(mailData);
  }

  async stallionAutoRenewal() {
    const today = new Date().toISOString().slice(0, 10);
    const queryBuilder = getRepository(StallionPromotion)
      .createQueryBuilder('stallionPromotion')
      .select(
        'stallionPromotion.id as promotionId, stallionPromotion.startDate as startDate, stallionPromotion.endDate as endDate, stallionPromotion.isAutoRenew as isAutoRenew, stallionPromotion.promotedCount as promotedCount, stallionPromotion.createdBy as promotedBy',
      )
      .addSelect(
        'stallion.stallionUuid as stallionId, stallion.horseId as horseId, stallion.createdBy as createdBy',
      )
      .addSelect('horse.horseName as horseName')
      .addSelect('stallionservicefee.fee as fee')
      .addSelect(
        'currency.currencyName as currencyName, currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect('farm.farmUuid as farmId, farm.farmName as farmName')
      .innerJoin('stallionPromotion.stallion', 'stallion')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('stallion.stallionservicefee', 'stallionservicefee')
      .innerJoin('stallionservicefee.currency', 'currency')
      .innerJoin('stallion.farm', 'farm')
      .andWhere(
        'stallionPromotion.isAutoRenew = 1 AND stallionPromotion.endDate < :endDate',
        { endDate: today },
      );

    const entities = await queryBuilder.getRawMany();
    const supperAdminRoleId = await parseInt(process.env.SUPER_ADMIN_ROLE_ID);
    const supperAdmin = await getRepository(Member)
      .createQueryBuilder('member')
      .select(
        'member.id as id,member.email as email,member.fullName as fullName',
      )
      .andWhere('member.roleId = :roleId ', { roleId: supperAdminRoleId })
      .getRawOne();

    // this.autoPaymentForRenewalStallion({stallionId:'D53B25EB-C753-EE11-AC1E-0A7165323890',userId:73,supperAdmin})

    for (const entity of entities) {
      this.autoPaymentForRenewalStallion({
        stallionId: entity.stallionId,
        userId: entity.promotedBy,
        supperAdmin,
      });
    }
  }

  async movingExpiredPromotionsToArchive() {
    const today = new Date().toISOString().slice(0, 10);
    const queryBuilder = getRepository(StallionPromotion)
      .createQueryBuilder('stallionPromotion')
      .select(
        'stallionPromotion.id promotionId, stallionPromotion.startDate startDate, stallionPromotion.endDate endDate, stallionPromotion.isAutoRenew isAutoRenew, stallionPromotion.promotedCount promotedCount,stallionPromotion.createdBy createdBy,stallionPromotion.stallionId stallionId',
      )
      .innerJoin('stallionPromotion.stallion', 'stallion')
      .innerJoin('stallionPromotion.member', 'member')
      .andWhere(
        'stallionPromotion.isAutoRenew <> 1 AND stallionPromotion.endDate < :endDate',
        { endDate: today },
      );

    const entities = await queryBuilder.getRawMany();
    console.log('entities', entities);
    for (const entity of entities) {
      const promoted = await getRepository(StallionPromotionArchive).save({
        startDate: entity.startDate,
        endDate: entity.endDate,
        stallionId: entity.stallionId,
        createdBy: entity.createdBy,
      });
      console.log('promoted', promoted);
      if (promoted && promoted.id) {
        await getRepository(StallionPromotion).delete({
          id: entity.promotionId,
        });
      }
    }
  }

  async sendPromoteStallionNotification(notificationAndMailData) {
    const messageTemplate = await this.getMessageTemplateByUuid(
      notificationTemplates.renewedStallionPromotedConfirmation,
    );
    const recipient = await getRepository(Member).findOne({
      id: notificationAndMailData.createdBy,
    });
    if (recipient) {
      if (messageTemplate) {
        const messageText = messageTemplate.messageText.replace(
          '{StallionName}',
          await this.toTitleCase(notificationAndMailData.horseName),
        );
        const messageTitle = messageTemplate.messageTitle;
        const actionUrl = messageTemplate.linkAction
          .replace('{farmName}', notificationAndMailData.farmName)
          .replace('{farmId}', notificationAndMailData.farmId);
        const preferedNotification =
          await this.getPreferredNotificationByNotificationTypeCode(
            notificationType.PROMOTIONAL,
            recipient.id,
          );

        const createNotification = {
          messageTemplateId: messageTemplate?.id,
          notificationShortUrl: 'notificationShortUrl',
          recipientId: recipient.id,
          messageTitle,
          messageText,
          isRead: false,
          notificationType: preferedNotification?.notificationTypeId,
          actionUrl,
        };
        const notificationCreated = await getRepository(Notifications).save(
          createNotification,
        );
        await this.sendStallionHotNotificationToAdmin(createNotification);

        if (messageTemplate.emailSms) {
          if (!preferedNotification || preferedNotification.isActive) {
            this.sendPromotionMail(notificationAndMailData, recipient);
          }
        }
      }
    }
  }

  async sendPromotionMail(data, recipient) {
    let mailData = {
      to: recipient.email,
      subject: 'Stallion Promotion',
      text: '',
      template: '/promoted-success',
      context: {
        farmAdminName: await this.toTitleCase(recipient.fullName),
        stallionName: await this.toTitleCase(data.horseName),
        expiryDate: format(new Date(data.endDate), 'ddd MMM dd yyyy'),
        viewOrder:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_MEMBER_PROFILE_URI,
        promotionFee: data.price,
      },
    };
    console.log('=== sendPromotionMail mailData', mailData);
    this.mailService.sendMailCommon(mailData);
  }

  async stallionHotNotification(days: number) {
    let today = new Date();
    const dateBefore = today.setDate(today.getDate() - days);
    const startDate = await this.setHoursZero(new Date(dateBefore));
    const endDate = await this.setToMidNight(new Date());
    // console.log(startDate,'======================',endDate)
    let ssmQueryBuilder = getRepository(SearchStallionMatch)
      .createQueryBuilder('sm')
      .select('COUNT(sm.stallionId) as noofsearch, sm.stallionId')
      .innerJoin('sm.stallion', 's')
      .innerJoin('s.farm', 'f')
      .groupBy('sm.stallionId');

    let ssmQueryBuilders = getRepository(SearchStallionMatch)
      .createQueryBuilder('ssm')
      .select('noofsearch, ssm.stallionId, ssm.mareId, stallion.farmId')
      .addSelect('horse.id as horseId, horse.horseName as horseName')
      .addSelect('mare.horseName as mareName')
      .innerJoin('ssm.stallion', 'stallion')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('ssm.mare', 'mare')
      .innerJoin(
        '(' + ssmQueryBuilder.getQuery() + ')',
        'sssm',
        'sssm.stallionId=stallion.id',
      )
      .orderBy('ssm.createdOn', 'DESC')
      .andWhere('ssm.createdOn >= :startDate AND ssm.createdOn <= :endDate', {
        startDate,
        endDate,
      });

    const entities = await ssmQueryBuilders.getRawMany();
    // console.log('============== stallionHotNotification',entities)
    let entitiList = [];
    let elementIndex = -1;
    for (let entity of entities) {
      const isExist = entitiList.find((element, index) => {
        if (
          element.stallionId === entity.stallionId &&
          element.mareId === entity.mareId &&
          element.farmId === entity.farmId
        ) {
          elementIndex = index;
          return true;
        }
      });
      if (!isExist) {
        entitiList.push({
          count: 1,
          stallionId: entity.stallionId,
          mareId: entity.mareId,
          farmId: entity.farmId,
        });
      } else if (isExist.count === 1) {
        entitiList[elementIndex].count = 2;
        const qb = getRepository(MemberFarm)
          .createQueryBuilder('memberFarm')
          .select('member.id,member.email, member.fullName')
          .addSelect('farm.farmUuid as farmUuid, farm.farmName as farmName')
          .innerJoin('memberFarm.member', 'member')
          .innerJoin('memberFarm.farm', 'farm')
          .andWhere('memberFarm.farmId = :farmId', { farmId: entity.farmId });

        const farmMember = await qb.getRawMany();
        for (let member of farmMember) {
          this.sendStallionHotNotification(entity, member);
        }
      }
    }
  }

  async sendStallionHotNotification(notificationAndMailData, recipient) {
    const messageTemplate = await this.getMessageTemplateByUuid(
      notificationTemplates.stallionHotNotificationFarms,
    );
    if (messageTemplate) {
      const messageText = messageTemplate.messageText
        .replace(
          '{StallionName}',
          await this.toTitleCase(notificationAndMailData.horseName),
        )
        .replace(
          '{Mare Name}',
          await this.toTitleCase(notificationAndMailData.mareName),
        );
      const messageTitle = messageTemplate.messageTitle;
      const actionUrl = messageTemplate.linkAction
        .replace('{farmName}', recipient.farmName)
        .replace('{farmId}', recipient.farmId);
      const preferedNotification =
        await this.getPreferredNotificationByNotificationTypeCode(
          notificationType.SYSTEM_NOTIFICATIONS,
          recipient.id,
        );

      const createNotification = {
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: recipient.id,
        messageTitle,
        messageText,
        actionUrl,
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
      };
      const notificationCreated = await getRepository(Notifications).save(
        createNotification,
      );
      await this.sendStallionHotNotificationToAdmin(createNotification);
      if (messageTemplate.emailSms) {
        if (!preferedNotification || preferedNotification.isActive) {
          this.sendStallionHotMail(notificationAndMailData, recipient);
        }
      }
    }
  }

  async sendStallionHotNotificationToAdmin(createNotification) {
    const supperAdminRoleId = parseInt(process.env.SUPER_ADMIN_ROLE_ID);
    const admins = await getRepository(Member).find({
      roleId: supperAdminRoleId,
    });
    admins.forEach(async (recipient) => {
      createNotification.recipientId = recipient.id;
      const notificationCreated = await getRepository(Notifications).save(
        createNotification,
      );
    });
  }

  async sendStallionHotMail(data, recipient) {
    let mailData = {
      to: recipient.email,
      subject: 'Stallion Hot Notification',
      text: '',
      template: '/stallion-hot-notification',
      context: {
        stallionName: await this.toTitleCase(data.horseName),
        mareName: await this.toTitleCase(data.mareName),
        viewReport:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_REPORT_URI,
      },
    };
    console.log('=== sendStallionHotMail mailData', mailData);

    this.mailService.sendMailCommon(mailData);
  }

  async renewalReminderFarms(days: number) {
    console.log('renewalReminderFarms job!');
    let today = new Date();
    const dateAfter = today.setDate(today.getDate() + days);
    const startDate = await this.setHoursZero(new Date(dateAfter));
    const endDate = await this.setToMidNight(new Date(dateAfter));
    const queryBuilder = getRepository(StallionPromotion)
      .createQueryBuilder('stallionPromotion')
      .select(
        'stallionPromotion.id as promotionId, stallionPromotion.startDate as startDate, stallionPromotion.endDate as endDate',
      )
      .addSelect(
        'stallion.stallionUuid as stallionId, stallion.horseId as horseId, stallion.createdBy as createdBy',
      )
      .addSelect('horse.horseName as horseName')
      .addSelect('stallionservicefee.fee as fee')
      .addSelect(
        'currency.currencyName as currencyName, currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect('farm.farmUuid as farmId, farm.farmName as farmName')
      .innerJoin('stallionPromotion.stallion', 'stallion')
      .innerJoin('stallion.horse', 'horse')
      .innerJoin('stallion.stallionservicefee', 'stallionservicefee')
      .innerJoin('stallionservicefee.currency', 'currency')
      .innerJoin('stallion.farm', 'farm')
      .andWhere(
        'stallionPromotion.endDate >= :startDate AND stallionPromotion.endDate <= :endDate',
        { startDate, endDate },
      );

    const entities = await queryBuilder.getRawMany();
    const messageTemplate = await this.getMessageTemplateByUuid(
      notificationTemplates.RenewalRemainderFarms,
    );

    for (const entity of entities) {
      const recipient = await getRepository(Member).findOne({
        id: entity.createdBy,
      });
      if (recipient) {
        this.sendRenewalReminderNotification(
          entity,
          recipient,
          messageTemplate,
        );
      }
    }
  }

  async sendRenewalReminderNotification(
    notificationAndMailData,
    recipient,
    messageTemplate,
  ) {
    let messageText = messageTemplate.messageText
      .replace(
        '{StallionName}',
        await this.toTitleCase(notificationAndMailData.horseName),
      )
      .replace(
        '{date}',
        await this.dateFormate(notificationAndMailData.endDate),
      );
    let messageTitle = messageTemplate.messageTitle;
    const actionUrl = messageTemplate.linkAction
      .replace('{farmName}', notificationAndMailData.farmName)
      .replace('{farmId}', notificationAndMailData.farmId);
    const preferedNotification =
      await this.getPreferredNotificationByNotificationTypeCode(
        notificationType.PROMOTIONAL,
        recipient.id,
      );

    const createNotification = {
      createdBy: 1,
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: recipient.id,
      messageTitle,
      messageText,
      actionUrl,
      isRead: false,
      notificationType: preferedNotification?.notificationTypeId,
    };
    const notificationCreated = await getRepository(Notifications).save(
      createNotification,
    );
    if (messageTemplate.emailSms) {
      if (!preferedNotification || preferedNotification.isActive) {
        this.sendRenewalReminderMail(notificationAndMailData, recipient);
      }
    }
  }

  async sendRenewalReminderMail(data, recipient) {
    let mailData = {
      to: recipient.email,
      subject: 'Renewal Reminder',
      text: '',
      template: '/renewal-reminder',
      context: {
        farmAdminName: await this.toTitleCase(recipient.fullName),
        stallionName: await this.toTitleCase(data.horseName),
        renewalDate: await this.dateFormate(data.endDate), //25 June, 2022
        price: data.currencyCode + ' ' + data.fee,
        renewNow:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_STALLION_ROSTER_URI +
          data.farmName +
          '/' +
          data.farmId,
      },
    };
    console.log('=== sendRenewalReminderMail mailData', mailData);

    this.mailService.sendMailCommon(mailData);
  }

  async loginReminder(days: number) {
    console.log('loginReminder job!');
    let today = new Date();
    const dateBefore = today.setDate(today.getDate() - days);
    const lastActiveDate = await this.setHoursZero(new Date(dateBefore));
    // const endDate = await this.setToMidNight(new Date());
    const queryBuilder = getRepository(Member)
      .createQueryBuilder('member')
      .select(
        'member.id as memberId, member.email as email, member.fullName as fullName , member.memberuuid as memberUuid, member.statusId as statusId, member.lastActive as lastActive',
      )
      .andWhere(
        'member.statusId IN (1,3) AND member.lastActive <= :lastActive',
        {
          lastActive: lastActiveDate,
        },
      );
    const entities = await queryBuilder.getRawMany();
    for (const entity of entities) {
      const recipient = await getRepository(Member).findOne({
        id: entity.memberId,
      });
      const preferedNotification =
        await this.getPreferredNotificationByNotificationTypeCode(
          notificationType.SYSTEM_NOTIFICATIONS,
          recipient.id,
        );

      if (!preferedNotification || preferedNotification.isActive) {
        this.sendLoginReminderMail(entity, recipient);
      }
    }
  }

  async sendLoginReminderMail(data, recipient) {
    let mailData = {
      to: recipient.email,
      subject:
        "We've noticed you haven't visited for a while. We're here to help!",
      text: '',
      template: '/login-reminder',
      context: {
        userName: await this.toTitleCase(recipient.fullName),
        logBackIn:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_DASHBOARD_URI,
        dashboard:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_DASHBOARD_URI,
        stallionSearch:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_STALLION_SEARCH_URI,
        farmDirectory:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_FARM_DIRECTORY_URI,
      },
    };

    this.mailService.sendMailCommon(mailData);
  }

  async stallionSearchReport(days: number) {
    let today = new Date();
    const dateBefore = today.setDate(today.getDate() - days);
    const startDate = await this.setHoursZero(new Date(dateBefore));
    const endDate = await this.setToMidNight(new Date());

    let ssmQueryBuilder = getRepository(SearchStallionMatch)
      .createQueryBuilder('sm')
      .select(
        'COUNT(sm.stallionId) as searchCount, sm.stallionId, f.id as farmId',
      )
      .innerJoin('sm.stallion', 's')
      .innerJoin('s.farm', 'f')
      .andWhere('sm.createdOn >= :startDate AND sm.createdOn <= :endDate', {
        startDate,
        endDate,
      })
      .groupBy('sm.stallionId, f.id');

    const entities = await ssmQueryBuilder.getRawMany();
    let entitiList = [];
    let elementIndex = -1;
    for (let entity of entities) {
      const isExist = entitiList.find((element, index) => {
        if (element.farmId === entity.farmId) {
          elementIndex = index;
          return true;
        }
      });
      if (!isExist) {
        entitiList.push({
          searchCount: entity.searchCount,
          farmId: entity.farmId,
        });
      } else {
        entitiList[elementIndex].searchCount =
          entitiList[elementIndex].searchCount + entity.searchCount;
      }
    }

    for (let farmData of entitiList) {
      const qb = getRepository(MemberFarm)
        .createQueryBuilder('memberFarm')
        .select(
          'farm.farmUuid as farmId, member.id,member.email, member.fullName',
        )
        .addSelect('farm.farmName as farmName')
        .innerJoin('memberFarm.member', 'member')
        .innerJoin('memberFarm.farm', 'farm')
        .andWhere('memberFarm.farmId = :farmId', { farmId: farmData.farmId });

      const farmMember = await qb.getRawMany();
      for (let member of farmMember) {
        this.sendStallinSearchNotification(farmData, member, days);
      }
    }
  }

  async sendStallinSearchNotification(notificationData, recipient, days) {
    let messageTemplateUuid = notificationTemplates.farmWeeklySearchUpdateFarms;
    if (days != 7) {
      messageTemplateUuid = notificationTemplates.farmMonthlySearchUpdateFarms;
    }

    const messageTemplate = await this.getMessageTemplateByUuid(
      messageTemplateUuid,
    );
    if (messageTemplate) {
      const preferedNotification =
        await this.getPreferredNotificationByNotificationTypeCode(
          notificationType.SYSTEM_NOTIFICATIONS,
          recipient.id,
        );

      let messageText;
      if (days != 7) {
        messageText = messageTemplate.messageText
          .replace('{Farm Name}', await this.toTitleCase(recipient.farmName))
          .replace('125', notificationData.searchCount);
      } else {
        messageText = messageTemplate.messageText
          .replace('{Farm Name}', await this.toTitleCase(recipient.farmName))
          .replace('30', notificationData.searchCount);
      }
      const actionUrl = messageTemplate.linkAction
        .replace('{farmName}', recipient.farmName)
        .replace('{farmId}', recipient.farmId);
      const messageTitle = messageTemplate.messageTitle;
      const createNotification = {
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: recipient.id,
        messageTitle,
        messageText,
        actionUrl,
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
      };
      const notificationCreated = await getRepository(Notifications).save(
        createNotification,
      );
    }
  }

  async farmAnalyticsReport(days: number) {
    let today = new Date();
    const dateBefore = today.setDate(today.getDate() - days);
    const startDate = await this.setHoursZero(new Date(dateBefore));
    const endDate = await this.setToMidNight(new Date());
    let farmQueryBuilder = getRepository(Farm)
      .createQueryBuilder('farm')
      .select(
        'farm.id as farmId, farm.farmName as farmName, farm.farmUuid as farmUuid',
      );

    const entities = await farmQueryBuilder.getRawMany();
    for (let farm of entities) {
      const pageViewCount = await this.getFarmPageViewCount({
        farmId: farm.farmId,
        startDate,
        endDate,
      });
      const stallionSearchCount = await this.getStallionSearchCount({
        farmId: farm.farmId,
        startDate,
        endDate,
      });
      const maresCount = await this.getMareSearchCount({
        farmId: farm.farmId,
        startDate,
        endDate,
      });
      // const memberCount = await this.getMemberCount({
      //   farmId: farm.farmId,
      //   startDate,
      //   endDate,
      // });
      const messageCount = await this.getMessageCount({
        farmId: farm.farmId,
        startDate,
        endDate,
      });
      const lastUpdatedDay = (await this.getFarmLastUpdate({
        farmId: farm.farmId,
        farmUuid: farm.farmUuid,
        startDate,
        endDate,
      }))
        ? 1
        : 0;
      const totalInteractions =
        pageViewCount + stallionSearchCount + maresCount + messageCount;
      const mailData = {
        farmId: farm.farmId,
        farmName: farm.farmName,
        pageViewCount,
        stallionSearchCount,
        // memberCount,
        maresCount,
        messageCount,
        totalInteractions,
        lastUpdatedDay,
        monthYear: startDate,
      };
      this.sendFarmAnalyticsReport(mailData);
    }
  }

  async getFarmPageViewCount(infoData) {
    const { farmId, startDate, endDate } = infoData;
    let queryBuilder = getRepository(PageView)
      .createQueryBuilder('pageView')
      .select(
        'COUNT(pageView.id) as pageViewCount, pageView.entityId as farmId',
      )
      .groupBy('pageView.entityId')
      .andWhere(
        "pageView.entityType = 'FARM' AND pageView.entityId = :farmId",
        { farmId },
      )
      .andWhere(
        'pageView.createdOn >= :startDate AND pageView.createdOn <= :endDate',
        { startDate, endDate },
      );

    const entity = await queryBuilder.getRawOne();
    // console.log('=================== getFarmPageViewCount',entity)
    return entity ? entity.pageViewCount : 0;
  }

  async getStallionSearchCount(infoData) {
    const { farmId, startDate, endDate } = infoData;
    let queryBuilder = getRepository(SearchStallionMatch)
      .createQueryBuilder('sm')
      .select('COUNT(sm.id) as stallionSearchCount, s.farmId as farmId')
      .innerJoin('sm.stallion', 's')
      .groupBy('s.farmId')
      .andWhere('s.farmId = :farmId', { farmId })
      .andWhere('sm.createdOn >= :startDate AND sm.createdOn <= :endDate', {
        startDate,
        endDate,
      });

    const entity = await queryBuilder.getRawOne();
    // console.log('=================== getStallionSearchCount',entity)
    return entity ? entity.stallionSearchCount : 0;
  }
  async getMareSearchCount(infoData) {
    const { farmId, startDate, endDate } = infoData;
    let queryBuilder = getRepository(SearchStallionMatch)
      .createQueryBuilder('sm')
      .select(
        'COUNT( DISTINCT sm.mareId) as mareSearchCount, s.farmId as farmId',
      )
      .innerJoin('sm.stallion', 's')
      .groupBy('s.farmId')
      .andWhere('s.farmId = :farmId', { farmId })
      .andWhere('sm.createdOn >= :startDate AND sm.createdOn <= :endDate', {
        startDate,
        endDate,
      });

    const entity = await queryBuilder.getRawOne();
    // console.log('=================== getStallionSearchCount',entity)
    return entity ? entity.mareSearchCount : 0;
  }

  async getMemberCount(infoData) {
    const { farmId, startDate, endDate } = infoData;
    let queryBuilder = getRepository(Member)
      .createQueryBuilder('member')
      .select(
        'COUNT(memberfarms.memberId) as memberCount, memberfarms.farmId as farmId',
      )
      .innerJoin('member.memberfarms', 'memberfarms')
      .innerJoin('memberfarms.farm', 'farm')
      .groupBy('memberfarms.farmId')
      .andWhere('memberfarms.farmId = :farmId', { farmId })
      .andWhere(
        'member.createdOn >= :startDate AND member.createdOn <= :endDate',
        { startDate, endDate },
      );

    const entity = await queryBuilder.getRawOne();
    // console.log('=================== getmemberCount',entity)
    return entity ? entity.memberCount : 0;
  }

  async getMessageCount(infoData) {
    const { farmId, startDate, endDate } = infoData;
    let queryBuilder = getRepository(Message)
      .createQueryBuilder('message')
      .select('COUNT(message.id) as messageCount, message.farmId as farmId')
      .groupBy('message.farmId')
      .andWhere('message.farmId = :farmId', { farmId })
      .andWhere(
        'message.createdOn >= :startDate AND message.createdOn <= :endDate',
        { startDate, endDate },
      );

    const entity = await queryBuilder.getRawOne();
    // console.log('=================== getmessageCount',entity)
    return entity ? entity.messageCount : 0;
  }

  async getFarmLastUpdate(infoData) {
    const { farmId, farmUuid, startDate, endDate } = infoData;
    let queryBuilder = getRepository(AuditFarm)
      .createQueryBuilder('auditFarm')
      .select(
        'auditFarm.id, auditFarm.entityId as farmUuid, auditFarm.createdOn as createdOn',
      )
      .andWhere('auditFarm.entityId = :farmUuid', { farmUuid })
      .orderBy('auditFarm.id', 'DESC');

    const entity = await queryBuilder.getRawOne();
    // console.log('=================== getFarmLastUpdate',entity)
    if (entity) {
      // console.log('================================',entity);
      return await this.calculateDiff(entity.createdOn);
    }
    return 0;
  }

  async sendFarmAnalyticsReport(mailData) {
    let queryBuilder = getRepository(Farm)
      .createQueryBuilder('farm')
      .select(
        'farm.id as farmId, farm.farmUuid as farmUuid, member.email as email, member.fullName as fullName',
      )
      .innerJoin('farm.memberfarms', 'memberfarms')
      .innerJoin('memberfarms.member', 'member')
      .andWhere('farm.id = :farmId', { farmId: mailData.farmId });

    const entities = await queryBuilder.getRawMany();
    console.log(
      '================================ sendFarmAnalyticsReport',
      entities,
    );
    for (let member of entities) {
      this.sendFarmAnalyticsMail(mailData, member);
    }
  }

  async sendFarmAnalyticsMail(notificationData, recipient) {
    let mailData = {
      to: recipient.email,
      subject: 'Farm Monthly Report',
      text: '',
      template: '/farm-monthly-report',
      context: {
        farmName: await this.toTitleCase(notificationData.farmName),
        pageViewCount: notificationData.pageViewCount,
        totalInteractions: notificationData.totalInteractions,
        stallionSearchCount: notificationData.stallionSearchCount,
        //    memberCount: notificationData.memberCount,
        maresCount: notificationData.maresCount,
        messageCount: notificationData.messageCount,
        lastUpdatedColor: await this.getColor(notificationData.lastUpdatedDay),
        lastUpdatedDay: notificationData.lastUpdatedDay,
        monthYear: await this.getMonthYear(notificationData.monthYear),
        farmDashboard:
          process.env.FRONTEND_DOMAIN +
          '/' +
          process.env.FRONTEND_APP_DASHBOARD_URI +
          notificationData.farmName +
          '/' +
          recipient.farmUuid,
      },
    };
    console.log('=== sendLoginReminderMail mailData', mailData);

    this.mailService.sendMailCommon(mailData);
  }

  async getColor(days) {
    const colors = ['#2EFFB4', '#1D472E', '#C75227'];

    if (days <= 10) return colors[0];
    else if (days <= 20) return colors[1];
    else return colors[2];
  }

  stopCronJob(jobName: string) {
    const job = this.schedulerRegistry.getCronJob(jobName);

    job.stop();
    console.log(job.lastDate());
  }

  async calculateDiff(dateSent) {
    let currentDate = new Date();
    dateSent = new Date(dateSent);

    return await Math.floor(
      (Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      ) -
        Date.UTC(
          dateSent.getFullYear(),
          dateSent.getMonth(),
          dateSent.getDate(),
        )) /
        (1000 * 60 * 60 * 24),
    );
  }

  async getDays(year, month) {
    return new Date(year, month, 0).getDate();
  }

  async setToMidNight(date = new Date()) {
    date.setHours(23, 59, 59, 999);
    return date;
  }

  async setHoursZero(date = new Date()) {
    date.setHours(0, 0, 0, 0);
    return date;
  }
  async setSecondZero(date = new Date()) {
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }
  async setSecond(date = new Date()) {
    date.setSeconds(59);
    return date;
  }

  async toPascalCase(text) {
    const words = text.match(/[a-z]+/gi);
    if (!words) {
      return '';
    }
    return words
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
      })
      .join(' ');
  }

  async toTitleCase(str) {
    if (!str) return str;
    return str
      .toLowerCase()
      .split(' ')
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  async dateFormate(date) {
    var month = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    let dateArr = date.toLocaleDateString('en-us').split('/');
    return (
      dateArr[1] + ' ' + month[parseInt(dateArr[0]) - 1] + ', ' + dateArr[2]
    );
  }

  async getMonthYear(date = new Date()) {
    var months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[date.getMonth()] + ', ' + date.getFullYear();
  }

  async getMessageTemplateByUuid(messageTemplateByUuid) {
    const queryBuilder = getRepository(MessageTemplate)
      .createQueryBuilder('messageTemplate')
      .select(
        'messagetemplate.id as id, messagetemplate.messageTitle, messagetemplate.messageText, messagetemplate.linkName, messagetemplate.msgDescription,messagetemplate.smFrontEnd,messagetemplate.forAdmin,messagetemplate.g1Slack,messagetemplate.breeder,messagetemplate.farmAdmin,messagetemplate.farmUser,messagetemplate.emailSms,farmUser,messagetemplate.linkAction',
      )
      .andWhere('messagetemplate.messageTemplateUuid = :messageTemplateUuid', {
        messageTemplateUuid: messageTemplateByUuid,
      });

    const messageTemplate = await queryBuilder.getRawOne();
    return messageTemplate;
  }

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

  async sendUpdateProfileNotification() {
    let today = new Date();
    const dateBefore = new Date(today.setDate(today.getDate() - 7));
    const startDate = await this.setHoursZero(new Date(dateBefore));
    const endDate = await this.setToMidNight(new Date(startDate));

    const images = await getRepository(MemberProfileImage)
      .createQueryBuilder('member')
      .select('Distinct(member.memberId) as memId,member.mediaId as mediaId')
      .andWhere('member.mediaId IS NOT null');

    const messageTemplate = await this.getMessageTemplateByUuid(
      notificationTemplates.updateMissingInformationProfile,
    );
    const recipient = await getRepository(Member)
      .createQueryBuilder('member')
      .select(
        'member.id,member.email,member.createdOn,memAddress.address,profile.mediaId',
      )
      .leftJoin('member.memberaddress', 'memAddress')
      .leftJoin('(' + images.getQuery() + ')', 'profile', 'memId=member.id')
      .where(
        ' member.createdOn >= :fromDate AND member.createdOn <= :endDate ',
        {
          fromDate: startDate,
          endDate: endDate,
        },
      )

      .andWhere(
        new Brackets((subQ) => {
          subQ
            .where('memAddress.address IS null')
            .orWhere('profile.mediaId IS null');
        }),
      );

    const recipients = await recipient.getRawMany();

    recipients.forEach(async (item) => {
      let fromMeberId = await getRepository(Member).findOne({ id: item.id });
      if (recipient) {
        if (messageTemplate) {
          const messageText = messageTemplate.messageText;
          const messageTitle = messageTemplate.messageTitle;
          const actionUrl = messageTemplate;
          const preferedNotification =
            await this.getPreferredNotificationByNotificationTypeCode(
              notificationType.SYSTEM_NOTIFICATIONS,
              fromMeberId.id,
            );

          const createNotification = {
            messageTemplateId: messageTemplate?.id,
            notificationShortUrl: 'notificationShortUrl',
            recipientId: fromMeberId.id,
            messageTitle,
            messageText,
            isRead: false,
            notificationType: preferedNotification?.notificationTypeId,
            actionUrl,
          };
          const notificationCreated = await getRepository(Notifications).save(
            createNotification,
          );
          if (messageTemplate.emailSms) {
            if (!preferedNotification || preferedNotification.isActive) {
              let mailData = {
                to: fromMeberId.email,
                subject: messageTitle,
                text: '',
                template: '/update-missing-information',
                context: {
                  viewProfile:
                    process.env.FRONTEND_DOMAIN +
                    '/' +
                    process.env.FRONTEND_APP_MEMBER_PROFILE_URI,
                },
              };
              console.log('=== profile update mailData', mailData);
              this.mailService.sendMailCommon(mailData);
            }
          }
        }
      }
    });
  }

  async cardExpiryNotifications() {
    let entities = await getRepository(MemberPaytypeAccess)
      .createQueryBuilder('mpa')
      .select('mpa.createdBy, mpa.customerId, mpa.paymentMethod')
      .addSelect('member.email as email, member.fullName as fullName')
      .innerJoin('mpa.member', 'member')
      .andWhere('mpa.isActive = 1')
      .andWhere('mpa.paymentMethodId = 1')
      .andWhere('mpa.paymentMethod IS NOT NULL')
      .andWhere("mpa.paymentMethod != ''")
      .getRawMany();
    console.log('=================entities', entities);
    if (entities && entities.length > 0) {
      entities.forEach(async (item) => {
        let paymentMethods = await stripe.paymentMethods.list({
          customer: item.customerId,
          type: 'card',
        });
        if (paymentMethods && paymentMethods.data.length > 0) {
          item.card = paymentMethods.data[0].card;
          let d = new Date();
          console.log(
            paymentMethods.data[0].card.exp_month,
            d.getMonth() + 1,
            paymentMethods.data[0].card.exp_year,
            d.getFullYear(),
          );

          if (
            paymentMethods.data[0].card.exp_month == d.getMonth() + 1 &&
            paymentMethods.data[0].card.exp_year == d.getFullYear()
          )
            this.sendCardExpiryMail(item);
        }
      });
    }
  }

  async sendCardExpiryMail(data) {
    const messageTemplate = await this.getMessageTemplateByUuid(
      notificationTemplates.UpdatePaymentMethod,
    );
    const messageTitle = messageTemplate.messageTitle;
    if (messageTemplate.emailSms) {
      const preferedNotification =
        await this.getPreferredNotificationByNotificationTypeCode(
          notificationType.SYSTEM_NOTIFICATIONS,
          data.createdBy,
        );

      if (
        (!preferedNotification || preferedNotification.isActive) &&
        data.card
      ) {
        let mailData = {
          to: data.email,
          subject: messageTitle,
          text: '',
          template: '/update-payment-method',
          context: {
            userName: await this.toTitleCase(data.fullName),
            brand: data.card.brand,
            expMonthYear: data.card.exp_month + '/' + data.card.exp_year, //21 April, 2022
            last4: data.card.last4,
            countryCode: data.card.country,
            updateNowLink:
              process.env.FRONTEND_DOMAIN + messageTemplate.linkAction,
          },
        };

        this.mailService.sendMailCommon(mailData);
      }
    }
  }

  async sendStallionHighSearchNotification() {
    //let results = [];
    //let count;
    const todaysDate = new Date();
    const messageTemplate = await this.getMessageTemplateByUuid(
      notificationTemplates.stallionHighSearchFlagFarms,
    );

    // const farmMember = await getRepository(MemberFarm)
    //   .createQueryBuilder('memberFarm')
    //   .select('DISTINCT memberFarm.memberId')
    //   .getRawMany();

    // let fMem = [];
    // farmMember.forEach((item) => {
    //   fMem.push(item.memberId);
    // });

    // const recipient = await getRepository(Member)
    //   .createQueryBuilder('member')
    //   .select('member.id,member.email,member.fullName')
    //   .andWhere('member.statusId IN(:...statusId)', { statusId: [1, 3] })
    //   .andWhere('member.id NOT IN(:...fMem)', { fMem: fMem })
    //   .orWhere('member.roleId = 5')
    //   .getRawMany();

    // const stallions = await getRepository(SearchStallionMatch)
    //   .createQueryBuilder('stallion')
    //   .select('stallion.stallionId,COUNT(*) as stallionCount')
    //   .groupBy('stallion.stallionId')
    //   .andWhere(
    //     'CAST(stallion.createdOn as DATE) = CONVERT(date, :todaysDate)',
    //     { todaysDate },
    //   )
    //   .getRawMany();

    // const total = await getRepository(SearchStallionMatch)
    //   .createQueryBuilder('stallion')
    //   .andWhere(
    //     'CAST(stallion.createdOn as DATE) = CONVERT(date, :todaysDate)',
    //     { todaysDate },
    //   )
    //   .getCount();

    // stallions.forEach(async (item) => {
    //   count = (item.stallionCount / total) * 100;
    //   if (parseInt(count) >= 50) results.push(item.stallionId);
    // });
    //results.forEach(async (entity) => {
      // const stallionInfo = await getRepository(Stallion)
      //   .createQueryBuilder('stal')
      //   .select('stal.id,horse.horseName as horseName')
      //   .innerJoin('stal.horse', 'horse')
      //   .andWhere('stal.id = :id', { id: entity })
      //   .getRawOne();

      let recipients = await getRepository(Stallion).manager.query(
        `EXEC procGetStallionHighSearchFlagData`,
      );

      await recipients.forEach(async (item) => {
        //let fromMeberId = await getRepository(Member).findOne({ id: item.id });
        if (item) {
          if (messageTemplate) {
            const messageText = messageTemplate.messageText.replace(
              '{StallionName}',
              await this.toTitleCase(item.stallionName),
            );
            const messageTitle = messageTemplate.messageTitle;
            const actionUrl = messageTemplate.linkName;
            const preferedNotification =
              await this.getPreferredNotificationByNotificationTypeCode(
                notificationType.SYSTEM_NOTIFICATIONS,
                item.memberId,
              );

            let notificationCount = await getRepository(Notifications)
              .createQueryBuilder('notifications')
              .andWhere('notifications.recipientId = :recipientId', {
                recipientId: item.memberId,
              })
              .andWhere(
                'notifications.messageTemplateId = :messageTemplateId',
                { messageTemplateId: messageTemplate?.id },
              )
              .andWhere('notifications.messageText = :messageText', {
                messageText: messageText,
              })
              .andWhere(
                'CAST(notifications.createdOn as DATE) = CONVERT(date, :todaysDate)',
                { todaysDate },
              )
              .getCount();

            if (!notificationCount) {
              const createNotification = {
                messageTemplateId: messageTemplate?.id,
                notificationShortUrl: 'notificationShortUrl',
                recipientId: item.memberId,
                messageTitle,
                messageText,
                isRead: false,
                notificationType: preferedNotification?.notificationTypeId,
                actionUrl,
              };
              await getRepository(Notifications).save(createNotification);
              if (messageTemplate.emailSms) {
                if (!preferedNotification || preferedNotification.isActive) {
                  let mailData = {
                    to: item.memberEmail,
                    subject: `Your stallion is getting noticed!`,
                    text: '',
                    template: '/stallion-high-search-flag',
                    context: {
                      stallionName: await this.toTitleCase(
                        item.stallionName,
                      ),
                      viewReport:
                        process.env.FRONTEND_DOMAIN +
                        '/' +
                        process.env.FRONTEND_APP_REPORT_URI,
                    },
                  };
                  // console.log('=== stallion-high-search-flag mailData', mailData);
                  this.mailService.sendMailCommon(mailData);
                }
              }
            }
          }
        }
      });
    //});
  }
  async updateSaleStatus() {
    let today = new Date();
    const todayDate = new Date(today.setDate(today.getDate()));

    const sales = await getRepository(Sale)
      .createQueryBuilder('sale')
      .select('sale.Id as id,sale.salesName,sale.startDate,sale.endDate')
      .where(
        `'${todayDate.toISOString()}' BETWEEN sale.startDate AND sale.endDate`,
      )
      .where('sale.statusId = :status', { status: 1 })
      .getRawMany();

    if (sales.length > 0) {
      sales.forEach(async (element) => {
        const updateResult: UpdateResult = await getRepository(Sale).update(
          { Id: element.id },
          { statusId: SALES_STATUS.DEPLOYED },
        );
        if (updateResult.affected) {
          //   console.log("==============sale status updated==================");
        }
      });
    }

    console.log('=====================', sales);
  }
  async abandonedCart(Hours: number, days: number) {
    let today = new Date();
    const hoursBefore = new Date(today.setHours(today.getHours() - Hours));
    console.log(
      '=============hoursBefore',
      hoursBefore,
      'today========',
      today,
    );
    const start = await this.setSecondZero(new Date(hoursBefore));
    const end = await this.setSecond(new Date(hoursBefore));
    const queryBuilder = getRepository(Cart)
      .createQueryBuilder('cart')
      .select(
        'cart.id as cartId, cart.createdOn as createdOn, cart.email as email, cart.createdBy as createdBy',
      )
      .addSelect(
        'cartProduct.quantity as quantity ,cartProduct.price as price,cartProduct.id as cartProductId',
      )
      .addSelect(
        'product.productCode as productCode,product.productName as productName',
      )
      .innerJoin('cart.cartProduct', 'cartProduct')
      .innerJoin('cartProduct.product', 'product');
    queryBuilder
      .andWhere('cart.createdOn >= DATEADD(HOUR, +3, cart.createdOn)')
      .andWhere(
        'cart.abandonedCartEmailTrigger IS NULL OR cart.abandonedCartEmailTrigger = 0',
      );
    const entities = await queryBuilder.getRawMany();
    this.productDetails(entities, Hours);
  }
  async abandonedCart24hr(Hours: number, days: number) {
    let today = new Date();
    const hoursBefore = new Date(today.setHours(today.getHours() - Hours));
    const start = await this.setSecondZero(new Date(hoursBefore));
    const end = await this.setSecond(new Date(hoursBefore));
    const queryBuilder = getRepository(Cart)
      .createQueryBuilder('cart')
      .select(
        'cart.id as cartId, cart.createdOn as createdOn, cart.email as email, cart.createdBy as createdBy',
      )
      .addSelect(
        'cartProduct.quantity as quantity ,cartProduct.price as price,cartProduct.id as cartProductId',
      )
      .addSelect(
        'product.productCode as productCode,product.productName as productName',
      )
      .innerJoin('cart.cartProduct', 'cartProduct')
      .innerJoin('cartProduct.product', 'product');
    if (Hours === 24) {
      queryBuilder
        .andWhere('cart.createdOn >= DATEADD(HOUR, +24, cart.createdOn)')
        .andWhere('cart.abandonedCartEmailTrigger = 1');
    }
    const entities = await queryBuilder.getRawMany();
    this.productDetails(entities, Hours);
  }
  async abandonedCart3day(Hours: number, days: number) {
    let today = new Date();
    const dateBefore = today.setDate(today.getDate() - days);
    const startDate = await this.setHoursZero(new Date(dateBefore));
    const endDate = await this.setToMidNight(new Date());
    const queryBuilder = getRepository(Cart)
      .createQueryBuilder('cart')
      .select(
        'cart.id as cartId, cart.createdOn as createdOn, cart.email as email, cart.createdBy as createdBy',
      )
      .addSelect(
        'cartProduct.quantity as quantity ,cartProduct.price as price,cartProduct.id as cartProductId',
      )
      .addSelect(
        'product.productCode as productCode,product.productName as productName',
      )
      .innerJoin('cart.cartProduct', 'cartProduct')
      .innerJoin('cartProduct.product', 'product');
    queryBuilder
      .andWhere('cart.createdOn >= DATEADD(DAY, +3, cart.createdOn)')
      .andWhere('cart.abandonedCartEmailTrigger = 2');
    const entities = await queryBuilder.getRawMany();
    this.productDetails(entities, Hours);
  }
  async productDetails(entities, Hours) {
    if (entities.length > 1) {
      var out: any = await Object.values(
        entities.reduce((a, v) => {
          if (a[v.createdBy]) {
            a[v.createdBy].productName = [
              a[v.createdBy].productName,
              v.productName,
            ]
              .join(',')
              .split(',');
            a[v.createdBy].quantity = [a[v.createdBy].quantity, v.quantity]
              .join(',')
              .split(',');
            a[v.createdBy].price = [a[v.createdBy].price, v.price]
              .join(',')
              .split(',');
            a[v.createdBy].cartProductId = [
              a[v.createdBy].cartProductId,
              v.cartProductId,
            ]
              .join(',')
              .split(',');
              a[v.createdBy].cartId = [
                a[v.createdBy].cartId,
                v.cartId,
              ]
                .join(',')
                .split(',');
            a[v.createdBy].productCode = [
              a[v.createdBy].productCode,
              v.productCode,
            ]
              .join(',')
              .split(',');
          } else {
            a[v.createdBy] = v;
          }
          return a;
        }, {}),
      );
    } else {
      out = entities;
    }
    let z;
    for (z = 0; z < out.length; z++) {
      var productDetails = [];
      let annual = '';
      var productDetail = '';
      let mediaUrl;
      let items = '';
      if (typeof out[z]['productName'] === 'object') {
        console.log('inside=====', typeof out[z]['productName']);
        //out[z]['productName'].forEach(async (num1, index) => {
        await out[z]['productName'].reduce(async (promise, num1, index) => {
          await promise;
          items = '';
          const num2 = out[z]['quantity'][index];
          const num3 = out[z]['price'][index];
          const num4 = out[z]['cartProductId'][index];
          const num5 = out[z]['productCode'][index];
          const obj = {
            productName: num1,
            quantity: num2,
            price: num3,
            productCode: num5,
          };
          let cartProduct = await this.findCartProductInfo(num4);
          console.log(
            '************************ obj.productName ***************',
            obj.productName,
          );
          let productInfo = await this.productInfo(num4);
          console.log(
            '==========================productInfo===========',
            productInfo,
          );
          if (obj.productCode == 'PROMOTION_STALLION') {
            //    await stallionPromotionService.notifyAfterPromotion(member,element.stallionId,id )
            annual = '(Annual)';
            let stallionProfileImage = await getRepository(StallionProfileImage)
              .createQueryBuilder('spi')
              .select(
                'spi.stallionId as mediaStallionId, media.mediaUrl as mediaUrl',
              )
              .innerJoin(
                'spi.media',
                'media',
                'media.id=spi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
              )
              .andWhere("media.mediaUrl IS NOT NULL AND media.mediaUrl != ''")
              .andWhere('spi.stallionId = :stallionId', {
                stallionId: cartProduct.stallionId,
              })
              .getRawOne();

            if (stallionProfileImage) {
              mediaUrl = stallionProfileImage.mediaUrl;
            } else {
              mediaUrl = process.env.DEFAULT_STALLION_PROFILE_IMAGE;
            }
          }

          items =
            items +
            `<table cellspacing="0" cellpadding="0" vertical-align='top' width="510" align="center" style="margin-top: 0px; border-top: solid 1px #DFE1E4; border-bottom: solid 1px #DFE1E4; padding-top: 20px; padding-bottom: 10px;">
              <tr>
                    <td align="left" width="120"><img src="${mediaUrl}" alt='${await this.commonUtilsService.toTitleCase(
              obj.productName,
            )}' width="120" style="padding-right:0px; width:90px; height:90px; border-radius:8px;object-fit: cover;"/></td>
                    <td>
                    <h2 style="margin: 0px;  padding:10px 0px 5px 0px; font-family: Arial; font-size:16px; color:#161716; font-weight: 400; line-height: 22px;"><b>${await this.commonUtilsService.toTitleCase(
                      obj.productName,
                    )}</b> ${annual}</h2>`;

          if (
            obj.productCode == 'REPORT_SHORTLIST_STALLION' ||
            obj.productCode == 'REPORT_STALLION_MATCH_PRO'
          ) {
            productDetail =
              (await this.commonUtilsService.toTitleCase(
                productInfo?.mareName,
              )) +
              ' x ' +
              obj.quantity +
              ' Stallions';
            items =
              items +
              `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetail}</p>`;
          } else if (obj.productCode == 'REPORT_STALLION_AFFINITY') {
            productDetail = await this.commonUtilsService.toTitleCase(
              productInfo.stallionName,
            );
            items =
              items +
              `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetail}</p>`;
          } else if (obj.productCode == 'PROMOTION_STALLION') {
            productDetail =
              (await this.commonUtilsService.toTitleCase(
                productInfo?.stallionName,
              )) +
              '<br> Renews ' +
              (await this.commonUtilsService.dateFormate(
                productInfo?.expiryDate,
              ));
            items =
              items +
              `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetail} </p>`;
          } else if (
            obj.productCode == 'REPORT_BROODMARE_AFFINITY' ||
            obj.productCode == 'REPORT_BROODMARE_SIRE'
          ) {
            productDetail = await this.commonUtilsService.toTitleCase(
              productInfo.mareName,
            );
            items =
              items +
              `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetail}</p>`;
          }
          items =
            items +
            `
                  </td>
                  <td align="right"> 
                      <p style="margin: 0px;  padding:10px 0px 0px 0px; font-family: Arial; font-size:20px; color:#1D472E; font-weight: 400; line-height: 22px;">` +
            'AUD' +
            ` ` +
            obj.price +
            `</p>
                  </td>
              </tr>
          </table>
          `;

          productDetails.push(items);
        }, Promise.resolve());
      } else {
        let cartProduct = await this.findCartProductInfo(out[z].cartProductId);
        let productInfo = await this.productInfo(out[z].cartProductId);
        if (out[z].productCode == 'PROMOTION_STALLION') {
          annual = '(Annual)';
          let stallionProfileImage = await getRepository(StallionProfileImage)
            .createQueryBuilder('spi')
            .select(
              'spi.stallionId as mediaStallionId, media.mediaUrl as mediaUrl',
            )
            .innerJoin(
              'spi.media',
              'media',
              'media.id=spi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
            )
            .andWhere("media.mediaUrl IS NOT NULL AND media.mediaUrl != ''")
            .andWhere('spi.stallionId = :stallionId', {
              stallionId: cartProduct.stallionId,
            })
            .getRawOne();

          if (stallionProfileImage) {
            mediaUrl = stallionProfileImage.mediaUrl;
          } else {
            mediaUrl = process.env.DEFAULT_STALLION_PROFILE_IMAGE;
          }
        }

        items =
          items +
          `<table cellspacing="0" cellpadding="0" vertical-align='top' width="510" align="center" style="margin-top: 0px; border-top: solid 1px #DFE1E4; border-bottom: solid 1px #DFE1E4; padding-top: 20px; padding-bottom: 10px;">
        <tr>
              <td align="left" width="120"><img src="${mediaUrl}" alt='${await this.commonUtilsService.toTitleCase(
            out[z].productName,
          )}' width="120" style="padding-right:0px; width:90px; height:90px; border-radius:8px;object-fit: cover;"/></td>
              <td>
              <h2 style="margin: 0px;  padding:10px 0px 5px 0px; font-family: Arial; font-size:16px; color:#161716; font-weight: 400; line-height: 22px;"><b>${await this.commonUtilsService.toTitleCase(
                out[z].productName,
              )}</b> ${annual}</h2>`;

        if (
          out[z].productCode == 'REPORT_SHORTLIST_STALLION' ||
          out[z].productCode == 'REPORT_STALLION_MATCH_PRO'
        ) {
          productDetail =
            (await this.commonUtilsService.toTitleCase(productInfo?.mareName)) +
            ' x ' +
            out[z].quantity +
            ' Stallions';
          items =
            items +
            `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetail}</p>`;
        } else if (out[z].productCode == 'REPORT_STALLION_AFFINITY') {
          productDetail = await this.commonUtilsService.toTitleCase(
            productInfo.stallionName,
          );
          items =
            items +
            `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetail}</p>`;
        } else if (out[z].productCode == 'PROMOTION_STALLION') {
          productDetail =
            (await this.commonUtilsService.toTitleCase(
              productInfo?.stallionName,
            )) +
            '<br> Renews ' +
            (await this.commonUtilsService.dateFormate(
              productInfo?.expiryDate,
            ));
          items =
            items +
            `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetail} </p>`;
        } else if (
          out[z].productCode == 'REPORT_BROODMARE_AFFINITY' ||
          out[z].productCode == 'REPORT_BROODMARE_SIRE'
        ) {
          productDetail = await this.commonUtilsService.toTitleCase(
            productInfo.mareName,
          );
          items =
            items +
            `<p style="margin: 0px;  padding:3px 30px 3px 0px; font-family: Arial; font-size: 16px; color: #626E60; font-weight: 400; line-height: 20px;">${productDetail}</p>`;
        }
        items =
          items +
          `
            </td>
            <td align="right"> 
                <p style="margin: 0px;  padding:10px 0px 0px 0px; font-family: Arial; font-size:20px; color:#1D472E; font-weight: 400; line-height: 22px;">` +
          'AUD' +
          ` ` +
          out[z].price +
          `</p>
            </td>
        </tr>
        </table>
        `;
        productDetails.push(items);
      }
      const recipient = await getRepository(Member).findOne({
        id: out[z].createdBy,
      });

      if (recipient) {
        this.sendAbandonedCartNotificationMail(
          out[z].cartId,
          recipient,
          productDetails,
          Hours,
        );
      }
    }
  }
  async sendAbandonedCartNotificationMail(cartId, data, productDetails, Hours) {
    let abandonedCartEmailTrigger;
    if (Hours === 3) {
      var subject = 'Abandoned Cart - 3 hours';
      var template = '/abandoned-cart';
      //For 3 Hours
      abandonedCartEmailTrigger = 1;
    } else if (Hours === 24) {
      var subject = 'Abandoned Cart - 24 hours';
      var template = '/abandoned-cart-24hrs';
      //For 1 Day
      abandonedCartEmailTrigger = 2;
    } else {
      var subject = 'Abandoned Cart - 3 days';
      var template = '/abandoned-cart-3days';
      //For 3 Days
      abandonedCartEmailTrigger = 3;
    }
    if (cartId) {
      if (Array.isArray(cartId)) {
        await getRepository(Cart).update(
          {
            id: In(cartId),
          },
          {
            abandonedCartEmailTrigger: abandonedCartEmailTrigger,
          },
        );
      } else {
        await getRepository(Cart).update(
          {
            id: cartId,
          },
          {
            abandonedCartEmailTrigger: abandonedCartEmailTrigger,
          },
        );
      }
    }

    let mailData = {
      to: data.email,
      subject: subject,
      text: '',
      template: template,
      context: {
        FarmAdminName: await this.toTitleCase(data?.fullName),
        productDetails: productDetails,
        //  process.env.FRONTEND_DOMAIN + messageTemplate.linkAction,
      },
    };

    this.mailService.sendMailCommon(mailData);
  }

  async findStallion(item) {
    var stallionProfileImage = await getRepository(StallionProfileImage)
      .createQueryBuilder('spi')
      .select('spi.stallionId as mediaStallionId, media.mediaUrl as mediaUrl')
      .leftJoin(
        'spi.media',
        'media',
        'media.id=spi.mediaId AND media.markForDeletion=0',
      )
      .andWhere("media.mediaUrl IS NOT NULL AND media.mediaUrl != ''")
      .andWhere('spi.stallionId = :stallionId', { stallionId: item.stallionId })
      .getRawOne();
    return stallionProfileImage;
  }
  async findCartProductInfo(item) {
    const cartProduct = await getRepository(CartProductItem)
      .createQueryBuilder('cartProductItem')
      .select(
        'cartProductItem.stallionId as stallionId,cartProductItem.farmId as farmId,cartProductItem.mareId as mareId,cartProductItem.stallionPromotionId as stallionPromotionId',
      )
      .andWhere('cartProductItem.cartProductId =:cartProductId', {
        cartProductId: item,
      })
      .getRawOne();
    return cartProduct;
  }
  async productInfo(item) {
    let productInfo = await getRepository(CartProductItem)
      .createQueryBuilder('orderProductItem')
      .select('mare.horseName as mareName')
      .addSelect('horse.horseName as stallionName')
      .addSelect('stallion.id as stallionId')
      .addSelect('stallionPromotion.endDate as expiryDate')
      .leftJoin(
        'orderProductItem.horse',
        'mare',
        'mare.isVerified=1 AND mare.isActive=1',
      )
      .leftJoin('orderProductItem.stallionPromotion', 'stallionPromotion')
      .leftJoin('orderProductItem.stallion', 'stallion')
      .leftJoin('stallion.horse', 'horse')
      .andWhere('orderProductItem.cartProductId = :cartProductId', {
        cartProductId: item,
      })
      .getRawOne();
    return productInfo;
  }

  async autoPaymentForRenewalStallion(data) {
    const { stallionId, userId, supperAdmin } = data;

    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('st')
      .select(
        'st.stallionUuid stallionId,st.id id, st.createdBy createdBy, st.modifiedOn modifiedOn',
      )
      .addSelect('horse.horseName horseName')
      .addSelect('farm.farmName farmName, farm.farmUuid farmId')
      .addSelect(
        'promotion.id promotionId, promotion.endDate endDate, promotion.isAutoRenew isAutoRenew,promotion.promotedCount promotedCount',
      )
      .innerJoin('st.horse', 'horse')
      .innerJoin('st.farm', 'farm')
      .innerJoin('st.stallionpromotion', 'promotion')
      .andWhere('st.stallionUuid = :stallionId', { stallionId });

    const entities = await queryBuilder.getRawOne();

    if (entities && entities.isAutoRenew) {
      const member = await this.findMember({ id: userId });
      const promotiomProduct = await this.findOneByCode(
        PRODUCTCODES.PROMOTION_STALLION,
      );
      const paymentMethodRes = await this.getPaymentMethod({ id: 1 });
      const currencyRes = await this.getCurrency(1);
      const memberPaymentAccess = await this.getMemberPaytypeAccess({
        createdBy: member.id,
        paymentMethodId: PAYMENT_METHOD.CARD,
      });
      entities['price'] =
        promotiomProduct['currencyCode'] + ' ' + promotiomProduct?.price;
      entities['promotionExpiredDate'] =
        await this.commonUtilsService.dateFormate(entities.endDate);
      if (
        !memberPaymentAccess ||
        !memberPaymentAccess.customerId ||
        !memberPaymentAccess.paymentMethod ||
        !memberPaymentAccess.isActive
      ) {
        console.log('---------------failedPaymentMail');
        this.failedPaymentMail(entities);
      } else {
        const promotionTransaction = await getRepository(OrderTransaction)
          .createQueryBuilder('ot')
          .select('ot.transactionId transactionId')
          .innerJoin('ot.orderproduct', 'op')
          .innerJoin('op.orderProductItem', 'opi')
          .andWhere('opi.stallionPromotionId = :stallionPromotionId', {
            stallionPromotionId: entities.promotionId,
          })
          .orderBy('ot.id', 'DESC')
          .getRawOne();

        const paymentIntent = await stripe.charges.retrieve(
          promotionTransaction?.transactionId,
        );
        let shippingAddress = paymentIntent?.shipping?.address;
        const total = promotiomProduct?.price;
        let billingAddress: any = {};
        if (member.memberaddress) {
          const memberAddress: any = member.memberaddress;
          billingAddress['country'] = memberAddress?.countryName;
          if (memberAddress.address) {
            billingAddress['line1'] = memberAddress.address;
          } else {
            billingAddress['line1'] = shippingAddress.line1;
          }
          if (memberAddress.postcode) {
            billingAddress['postal_code'] = memberAddress.postcode;
          } else {
            billingAddress['postal_code'] = shippingAddress.postal_code;
          }
        } else {
          billingAddress['country'] = shippingAddress.country;
          billingAddress['line1'] = shippingAddress.line1;
          billingAddress['postal_code'] = shippingAddress.postal_code;
        }

        var params = {
          payment_method_types: [paymentMethodRes?.paymentMethod],
          amount: total,
          currency: currencyRes.currencyCode,
          confirm: true,
          off_session: true,
          customer: memberPaymentAccess.customerId,
          payment_method: memberPaymentAccess.paymentMethod,
          description: 'Payment for Auto Renew Stallion',
          shipping: {
            name: member.fullName,
            address: billingAddress,
          },
        };

        try {
          const paymentIntent = await stripe.paymentIntents.create(params);
          if (paymentIntent) {
            if (paymentIntent.charges.data[0].paid == true) {
              const orderStatus = await getRepository(OrderStatus).findOne({
                orderStatusCode: ordersStatusList.ORDERED,
              });

              const charge = paymentIntent.charges.data[0];
              const orderDto = new CreateOrderDto();
              orderDto.sessionId = charge.id;
              orderDto.currencyId = currencyRes.id;
              orderDto.countryId = DEFAULT_VALUES.COUNTRY;
              orderDto.postalCode = '';
              orderDto.email = member.email;
              orderDto.fullName = member.fullName;
              orderDto['total'] = total;
              orderDto['orderStatusId'] = orderStatus?.id;
              orderDto.createdBy =
                supperAdmin && supperAdmin.id ? supperAdmin.id : null;
              orderDto.memberId = member && member.id ? member.id : null;
              const order = await getRepository(Order).save(orderDto);
              this.updatePromotion(entities, member);

              if (order) {
                const createTransactionDto = new CreateTransactionDto();
                createTransactionDto.createdBy =
                  supperAdmin && supperAdmin.id ? supperAdmin.id : null;
                createTransactionDto.total = total;
                createTransactionDto.subTotal = total;
                createTransactionDto.status = charge.status;
                createTransactionDto.paymentStatus =
                  charge.paid == true ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.UNPAID;
                createTransactionDto.memberId =
                  member && member.id ? member.id : null;
                createTransactionDto.mode = paymentMethodRes?.paymentMethod;
                createTransactionDto.paymentMethod = PAYMENT_METHOD.CARD;
                createTransactionDto.orderId = order.id;
                createTransactionDto.receiptUrl = charge.receipt_url;
                createTransactionDto.transactionId = charge.id;

                const record =
                  getRepository(OrderTransaction).save(createTransactionDto);

                const productData = await getRepository(Product).findOne({
                  productCode: PRODUCTCODES.PROMOTION_STALLION,
                });
                const orderProductData = new OrderProductDto();
                orderProductData.orderId = order['id'];
                orderProductData.productId = productData.id;
                orderProductData.price = total;
                orderProductData.quantity = 1;
                orderProductData.createdBy =
                  supperAdmin && supperAdmin.id ? supperAdmin.id : null;
                orderProductData.orderStatusId = orderStatus?.id;
                const createOrderProductResponse = await getRepository(
                  OrderProduct,
                ).create(orderProductData);
                if (createOrderProductResponse) {
                  const orderProductItemData = new OrderProductItemDto();
                  orderProductItemData.orderProductId =
                    createOrderProductResponse['id'];
                  orderProductItemData.stallionId = entities.id;
                  orderProductItemData.stallionPromotionId =
                    entities.promotionId;
                  orderProductItemData.createdBy =
                    supperAdmin && supperAdmin.id ? supperAdmin.id : null;

                  getRepository(OrderProductItem).create(orderProductItemData);
                  getRepository(ReportProductItem).create(orderProductItemData);
                }
              }
            } else {
              this.failedPaymentMail(entities);
            }
          } else {
            this.notifyPaymentCancel(entities);
          }
        } catch (err) {
          console.log('-----------------error', err?.raw?.message);
          this.failedPaymentMail(entities);

          return err;
        }
      }
    }
  }

  async notifyPaymentCancel(stallion) {
    const recipient = await getRepository(Member).findOne({
      id: stallion.createdBy,
    });

    let mailData = {
      to: recipient.email,
      subject: 'Cancellation of stallion due to payment failure',
      text: '',
      template: '/cancellation-of-stallion',
      context: {
        farmAdminName: await this.commonUtilsService.toTitleCase(
          recipient.fullName,
        ),
        rosterUrl:
          process.env.FRONTEND_DOMAIN +
          '/stallion-roster/' +
          stallion.farmName +
          '/' +
          stallion.farmId,
        promotionFee: stallion.price, //AUD 440
        stallionName: await this.commonUtilsService.toTitleCase(
          stallion.horseName,
        ),
        effectiveDate: stallion.promotionExpiredDate, //Expired 21 April, 2022
        expiredDate: stallion.promotionExpiredDate,
      },
    };

    this.mailService.sendMailCommon(mailData);
  }

  async updatePromotion(stallion, member) {
    let startDate = new Date();
    let endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    endDate = new Date(new Date(endDate).getTime() - 24 * 60 * 60 * 1000);
    const update = getRepository(StallionPromotion).update(
      { id: stallion.promotionId },
      {
        startDate: startDate,
        endDate: endDate,
        expiryDate: endDate,
        promotedCount: parseInt(stallion.promotedCount) + 1,
        modifiedBy: member['id'],
      },
    );

    this.sendPromoteStallionNotification(stallion);
  }

  async failedPaymentMail(stallion) {
    const recipient = await this.findMember({ id: stallion.createdBy });
    let mailData = {
      to: recipient.email,
      subject: 'Failed Payment',
      text: '',
      template: '/promoted-failed-payment',
      context: {
        farmAdminName: await this.commonUtilsService.toTitleCase(
          recipient.fullName,
        ),
        stallionName: await this.commonUtilsService.toTitleCase(
          stallion.horseName,
        ),
        rosterUrl:
          process.env.FRONTEND_DOMAIN +
          '/stallion-roster/' +
          stallion.farmName +
          '/' +
          stallion.farmId,
        expiredDate: stallion.promotionExpiredDate,
        promotionFee: stallion.price,
      },
    };

    this.mailService.sendMailCommon(mailData);
    this.notifyPaymentCancel(stallion);
  }

  /* Get Member And Member Address information  */
  async findMember(fields) {
    const result = await getRepository(Member)
      .createQueryBuilder('member')
      .select(
        'member.id as id, member.memberUuid as memberuuid, member.email as email, member.fullName as fullName, member.isVerified isVerified',
      )
      .andWhere(fields)
      .getRawOne();

    if (result) {
      result.memberaddress = {};
      const memberaddress = await this.findMemberAddress(result.id);
      if (memberaddress) {
        result.memberaddress = memberaddress;
      }
    }
    return result;
  }

  /* Get a member address */
  async findMemberAddress(memberId) {
    const queryBuilder = getRepository(MemberAddress)
      .createQueryBuilder('ma')
      .select(
        'ma.countryId, ma.stateId, ma.city, ma.address,currency.currencyCode',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName, state.stateCode as stateCode')
      .leftJoin('ma.country', 'country')
      .leftJoin('country.currency', 'currency')
      .leftJoin('ma.state', 'state')
      .andWhere({ memberId: memberId })
      .orderBy('ma.createdOn', 'DESC');

    return await queryBuilder.getRawOne();
  }

  /* Get Product by code */
  async findOneByCode(productCode: string) {
    let product = getRepository(Product)
      .createQueryBuilder('product')
      .select(
        'product.id, product.productName, product.categoryId, product.marketingPageInfoId, product.productCode productCode',
      )
      .addSelect('pricing.price as price')
      .addSelect(
        'currency.id as currencyId, currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .innerJoin('product.pricing', 'pricing')
      .innerJoin('pricing.currency', 'currency', 'currency.id = :currencyId', {
        currencyId: DEFAULT_VALUES.CURRENCY,
      })
      .andWhere('product.productCode = :productCode', { productCode })
      .getRawOne();

    return product;
  }

  /* Get a payment method */
  async getPaymentMethod(fields) {
    return getRepository(PaymentMethod).findOne({ where: fields });
  }

  /* Get Currency By Id */
  async getCurrency(id: number) {
    let data = await getRepository(Currency).findOne({
      id,
    });
    return data;
  }

  //getting customer card details only
  async getMemberPaytypeAccess(fields) {
    let entities = await getRepository(MemberPaytypeAccess)
      .createQueryBuilder('mpa')
      .select('mpa.createdBy, mpa.customerId, mpa.paymentMethod, mpa.isActive')
      .addSelect('member.email as email, member.fullName as fullName')
      .innerJoin('mpa.member', 'member')
      .andWhere('mpa.isActive = 1')
      .andWhere('mpa.paymentMethodId = 1')
      .andWhere('mpa.paymentMethod IS NOT NULL')
      .andWhere("mpa.paymentMethod != ''");

    if (fields) {
      entities.andWhere(fields);
      return entities.getRawOne();
    }

    return entities.getRawMany();
  }

  //Every Month
  @Cron('0 0 1 * *', {
    name: 'sendMailToFarmUsersOnFarmDataNotUpdatedFromPast',
  })
  //Send Mail To FarmUsers On FarmData Not Updated From Past
  async sendMailToFarmUsersOnFarmDataNotUpdatedFromPast() {
    const farmUsersWithFarms = await getRepository(Stallion).manager.query(
      `EXEC procGetAllRequestFarmToUpdateInformationOnProfilePages`,
    );
    let self = this;
    await farmUsersWithFarms.map(async function (item) {
      let mailData = {
        to: item.email,
        subject: 'Stay Current & Increase your sales',
        text: '',
        template: '/update-farm-information-reminder',
        context: {
          farmName: await self.commonUtilsService.toTitleCase(item.farmName),
          memberFullName: await self.commonUtilsService.toTitleCase(
            item.fullName,
          ),
          actionUrl:
            process.env.FRONTEND_DOMAIN +
            '/stallion-roster/' +
            item.farmName +
            '/' +
            item.farmId,
        },
      };
      console.log(item.email);
      self.mailService.sendMailCommon(mailData);
    });
  }

  //Every MidNight
  @Cron('0 0 * * *', {
    name: 'clearAbandonedCartItems',
  })
  //Clear Abandoned Cart Items
  async clearAbandonedCartItems() {
    await getRepository(Stallion).manager.query(
      `EXEC procClearAbandonedCartItems`,
    );
  }

  async removeMessagesPermanently(){
      const member =  await getRepository(Member).findOne({roleId: parseInt(process.env.SUPER_ADMIN_ROLE_ID)})
      const results = await getRepository(AdminPageSettings).findOne({moduleId:9})
      const retainTrashPeriod = JSON.parse(results.settingsResponse)  

      console.log("==================  results.settingsResponse ===============",  results.settingsResponse ,retainTrashPeriod.retainTrashPeriod)
      // Get today's date
      const today = new Date();
      // Calculate the date retainTrashPeriod days ago
      const dateThreshold = new Date();
      dateThreshold.setDate(today.getDate() - retainTrashPeriod.retainTrashPeriod);
      const dateBefore =dateThreshold;
      const startDate = await this.setHoursZero(new Date(dateBefore));
      const endDate = await this.setToMidNight(new Date(dateBefore));
      console.log("=================retainTrashPeriod,dateBefore",startDate,endDate)
      
      // Query to find MessageChannels with modifiedOn date difference greater than 16 days
      const msgs = await getRepository(Message)
        .createQueryBuilder('message')
        .select('message.id as id')
        .where('message.isActive =:isActive', { isActive: false })
        .andWhere('message.modifiedOn >= :startDate AND message.modifiedOn <= :endDate', {
          startDate,
          endDate,
        })
        .getRawMany();
        console.log("=================msgChannelRes",msgs.length)
      let  msgRecptInfo;
      let channels =[]
      let uniqueChannels = new Set<string>(); // Using a Set to store unique channel IDs
      for (const obj of msgs) {
           msgRecptInfo = await getRepository(MessageRecipient).findOne({
            messageId: obj.id,
          });
          const response1 = await getRepository(MessageRecipient).delete({
            messageId: obj.id
          });
        
          //Removing Message Media
          await  getRepository(Message).manager.query(
            `EXEC procRemoveMessageMedia 
                           @messageId=@0,
                           @memberId=@1`,
            [obj.id, member.id],
          );

          const response = await getRepository(Message).delete({
            id: obj.id,
          });
          // Push channel IDs into the Array
          channels.push(msgRecptInfo.channelId)
        }
      
      const uniqueChannelIds =  [...new Set(channels)]; 
      console.log('Unique Channel IDs:', uniqueChannelIds);

      // Now, you can proceed with deleting message channels based on uniqueChannelIds array
       for (const ChannelId of uniqueChannelIds) {
        // Check if there are no remaining messages under the channel
        const channelMessages = await getRepository(MessageRecipient).find({
          channelId:ChannelId
        });
        if (channelMessages.length === 0) {
          // If there are no remaining messages under the channel, delete the channel
          await getRepository(MessageChannel).delete({id:ChannelId});
        }
      }
    }
    
         
  
}
