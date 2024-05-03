import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { MailModule } from 'src/mail/mail.module';
import { ContactusController } from './contactus.controller';
import { ContactusService } from './contactus.service';
import { Contactus } from './entities/contactus.entity';
import { MembersModule } from 'src/members/members.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { PreferedNotificationsModule } from 'src/prefered-notifications/prefered-notifications.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contactus]),
    MailModule,
    CommonUtilsModule,
    MembersModule,
    MessageTemplatesModule,
    PreferedNotificationsModule,
    NotificationsModule,
  ],
  controllers: [ContactusController],
  providers: [ContactusService],
})
export class ContactusModule {}
