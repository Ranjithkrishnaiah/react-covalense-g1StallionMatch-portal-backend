import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from 'src/audit/audit.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { FarmsModule } from 'src/farms/farms.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { HorsesModule } from 'src/horses/horses.module';
import { MailModule } from 'src/mail/mail.module';
import { MediaModule } from 'src/media/media.module';
import { MemberFarmsModule } from 'src/member-farms/member-farms.module';
import { MembersModule } from 'src/members/members.module';
import { MessageChannelModule } from 'src/message-channel/message-channel.module';
import { MessageRecipientModule } from 'src/message-recepient/message-recipients.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PreferedNotificationsModule } from 'src/prefered-notifications/prefered-notifications.module';
import { StallionsModule } from 'src/stallions/stallions.module';
import { Message } from './entities/messages.entity';
import { MessageController } from './messages.controller';
import { MessageService } from './messages.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    FarmsModule,
    MessageRecipientModule,
    forwardRef(() => StallionsModule),
    MessageTemplatesModule,
    NotificationsModule,
    MessageChannelModule,
    MembersModule,
    MemberFarmsModule,
    HorsesModule,
    forwardRef(() => AuditModule),
    MediaModule,
    MailModule,
    PreferedNotificationsModule,
    CommonUtilsModule,
    FileUploadsModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessagesModule {}
