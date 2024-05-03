import { Module } from '@nestjs/common';
import { OrderTransactionService } from './order-transaction.service';
import { OrderTransactionsController } from './order-transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTransaction } from './entities/order-transaction.entity';
import { OrderModule } from 'src/orders/orders.module';
import { ProductsModule } from 'src/products/products.module';
import { PaymentMethodsModule } from 'src/payment-methods/payment-methods.module';
import { CurrenciesModule } from 'src/currencies/currencies.module';
import { MemberPaytypeAccessModule } from 'src/member-payment-access/member-paytype-access.module';
import { MembersModule } from 'src/members/members.module';
import { OrderProductModule } from 'src/order-product/order-product.module';
import { MailModule } from 'src/mail/mail.module';
import { PreferedNotificationsModule } from 'src/prefered-notifications/prefered-notifications.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { CartsModule } from 'src/carts/carts.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { OrderStatusModule } from 'src/order-status/order-status.module';
import { StallionPromotionService } from 'src/stallion-promotions/stallion-promotions.service';
import { StallionPromotionModule } from 'src/stallion-promotions/stallion-promotion.module';
import { PromoCodesModule } from 'src/promo-codes/promo-codes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderTransaction]),
    OrderModule,
    ProductsModule,
    PaymentMethodsModule,
    CurrenciesModule,
    MemberPaytypeAccessModule,
    MembersModule,
    OrderProductModule,
    MailModule,
    PreferedNotificationsModule,
    MessageTemplatesModule,
    NotificationsModule,
    CartsModule,
    CommonUtilsModule,
    OrderStatusModule,
    StallionPromotionModule,
    PromoCodesModule

  ],
  controllers: [OrderTransactionsController],
  providers: [OrderTransactionService],
  exports: [OrderTransactionService],
})
export class OrderTransactionModule {}
