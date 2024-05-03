import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionRequest } from './entities/stallion-request.entity';
import { StallionRequestsController } from './stallion-requests.controller';
import { StallionRequestsService } from './stallion-requests.service';
import { MailModule } from 'src/mail/mail.module';
import { CountryModule } from 'src/country/country.module';
import { MembersModule } from 'src/members/members.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationTypeModule } from 'src/notification-types/notification-types.module';

@Module({
  imports: [TypeOrmModule.forFeature([StallionRequest]),
   MailModule,
   CountryModule,
   MembersModule,
   CommonUtilsModule,
   NotificationsModule,
   MessageTemplatesModule,
   NotificationTypeModule,
  ],
  controllers: [StallionRequestsController],
  providers: [StallionRequestsService],
  exports: [StallionRequestsService],
})
export class StallionRequestsModule {}
