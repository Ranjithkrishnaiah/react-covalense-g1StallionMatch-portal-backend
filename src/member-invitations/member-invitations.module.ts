import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsModule } from 'src/farms/farms.module';
import { MailModule } from 'src/mail/mail.module';
import { MemberFarmsModule } from 'src/member-farms/member-farms.module';
import { MembersModule } from 'src/members/members.module';
import { MemberInvitation } from './entities/member-invitation.entity';
import { MemberInvitationsController } from './member-invitations.controller';
import { MemberInvitationsService } from './member-invitations.service';
import { MemberInvitationStallionsModule } from 'src/member-invitation-stallions/member-invitation-stallions.module';
import { StallionsModule } from 'src/stallions/stallions.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { memberInvitationSubscriber } from './member-invitations.subscriber';
import { PreferedNotificationsModule } from 'src/prefered-notifications/prefered-notifications.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { MemberFarmStallionsModule } from 'src/member-farm-stallions/member-farm-stallions.module';
import { FarmAccessLevelsModule } from 'src/farm-access-levels/farm-access-levels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberInvitation]),
    MembersModule,
    MailModule,
    FarmsModule,
    MemberFarmsModule,
    MemberInvitationStallionsModule,
    StallionsModule,
    NotificationsModule,
    MessageTemplatesModule,
    PreferedNotificationsModule,
    CommonUtilsModule,
    MemberFarmStallionsModule,
    FarmAccessLevelsModule,
  ],
  controllers: [MemberInvitationsController],
  providers: [MemberInvitationsService, memberInvitationSubscriber],
  exports: [MemberInvitationsService],
})
export class MemberInvitationsModule {}
