import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MareRequest } from './entities/mare-request.entity';
import { MareSubscriber } from './mare-request.subscriber';
import { MareRequestsController } from './mare-requests.controller';
import { MareRequestsService } from './mare-requests.service';
import { MailModule } from 'src/mail/mail.module';
import { CountryModule } from 'src/country/country.module';
import { MembersModule } from 'src/members/members.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationTypeModule } from 'src/notification-types/notification-types.module';

@Module({
  imports: [TypeOrmModule.forFeature([MareRequest]),
    MailModule,
    CountryModule,
    MembersModule,
    CommonUtilsModule,
    NotificationsModule,
    MessageTemplatesModule,
    NotificationTypeModule,
  ],
  controllers: [MareRequestsController],
  providers: [MareRequestsService, MareSubscriber],
  exports: [MareRequestsService],
})
export class MareRequestsModule {}
