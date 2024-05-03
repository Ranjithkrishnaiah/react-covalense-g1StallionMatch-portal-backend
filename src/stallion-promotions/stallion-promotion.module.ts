import { Module } from '@nestjs/common';
import { StallionPromotionService } from './stallion-promotions.service';
import { StallionPromotionController } from './stallion-promotions.controller';
import { StallionPromotion } from './entities/stallion-promotion.entity';
import { StallionsModule } from 'src/stallions/stallions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { PreferedNotificationsModule } from 'src/prefered-notifications/prefered-notifications.module';
import { MailModule } from 'src/mail/mail.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { StallionsPromotionSubscriber } from './stallion-promotion.subscriber';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { FarmsModule } from 'src/farms/farms.module';
import { AuditModule } from 'src/audit/audit.module';
import { ProductsModule } from 'src/products/products.module';
import { BoostProfileModule } from 'src/boost-profile/boost-profile.module';
import { MembersModule } from 'src/members/members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StallionPromotion]),
    StallionsModule,
    MessageTemplatesModule,
    NotificationsModule,
    PreferedNotificationsModule,
    MailModule,
    CommonUtilsModule,
    FarmsModule,
    AuditModule,
    ProductsModule,
    BoostProfileModule,
    MembersModule
  ],
  controllers: [StallionPromotionController],
  providers: [StallionPromotionService, StallionsPromotionSubscriber],
  exports: [StallionPromotionService],
})
export class StallionPromotionModule {}
