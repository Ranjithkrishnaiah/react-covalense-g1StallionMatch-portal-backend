import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { MailModule } from 'src/mail/mail.module';
import { MediaModule } from 'src/media/media.module';
import { MemberAddressModule } from 'src/member-address/member-address.module';
import { MemberProfileImageModule } from 'src/member-profile-image/member-profile-image.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PreferedNotificationsModule } from 'src/prefered-notifications/prefered-notifications.module';
import { SmpActivityTrackerModule } from 'src/smp-activity-tracker/smp-activity-tracker.module';
import { Member } from './entities/member.entity';
import { MemberRepository } from './member.repository';
import { MemberSubscriber } from './member.subscriber';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PageViewModule } from 'src/page-view/page-view.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, MemberRepository]),
    MemberAddressModule,
    CommonUtilsModule,
    MediaModule,
    FileUploadsModule,
    MemberProfileImageModule,
    MessageTemplatesModule,
    NotificationsModule,
    MailModule,
    PreferedNotificationsModule,
    SmpActivityTrackerModule,
    PageViewModule
  ],
  controllers: [MembersController],
  providers: [MembersService, MemberSubscriber],
  exports: [MembersService],
})
export class MembersModule {}
