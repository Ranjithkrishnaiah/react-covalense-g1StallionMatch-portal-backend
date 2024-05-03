import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { CartsModule } from 'src/carts/carts.module';
import { CartProductModule } from 'src/cart-product/cart-product.module';
import { CartProductItemsModule } from 'src/cart-product-items/cart-product-items.module';
import { OrderProductModule } from 'src/order-product/order-product.module';
import { OrderProductItemsModule } from 'src/order-product-items/order-product-items.module';
import { OrderReportModule } from 'src/order-report/order-report.module';
import { ReportTemplatesModule } from 'src/report-templates/report-templates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { MailModule } from 'src/mail/mail.module';
import { BoostProfileModule } from 'src/boost-profile/boost-profile.module';
import { ProductsModule } from 'src/products/products.module';
import { OrderStatusModule } from 'src/order-status/order-status.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { ReportProductItemsModule } from 'src/report-product-items/report-product-items.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    CartsModule,
    CartProductModule,
    CartProductItemsModule,
    OrderProductModule,
    OrderProductItemsModule,
    OrderReportModule,
    ReportTemplatesModule,
    NotificationsModule,
    MessageTemplatesModule,
    MailModule,
    BoostProfileModule,
    ProductsModule,
    OrderStatusModule,
    CommonUtilsModule,
    ReportProductItemsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrderModule {}
