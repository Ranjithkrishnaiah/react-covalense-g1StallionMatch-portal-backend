import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { CountryModule } from 'src/country/country.module';
import { FarmsModule } from 'src/farms/farms.module';
import { HorsesModule } from 'src/horses/horses.module';
import { MaresListInfoModule } from 'src/mare-list-info/mare-list-info.module';
import { MemberAddressModule } from 'src/member-address/member-address.module';
import { MembersModule } from 'src/members/members.module';
import { MessageChannelModule } from 'src/message-channel/message-channel.module';
import { MessagesModule } from 'src/messages/messages.module';
import { NominationRequestModule } from 'src/nomination-request/nomination-request.module';
import { StallionReasonsModule } from 'src/stallion-reasons/stallion-reasons.module';
import { StallionsModule } from 'src/stallions/stallions.module';
import { ActivityEntity } from './activity.entity';
import { ActivityService } from './activity.service';
import { PaymentMethodsModule } from 'src/payment-methods/payment-methods.module';
import { MemberInvitationsModule } from 'src/member-invitations/member-invitations.module';
import { FarmAccessLevelsModule } from 'src/farm-access-levels/farm-access-levels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityEntity]),
    MaresListInfoModule,
    MembersModule,
    HorsesModule,
    StallionsModule,
    FarmsModule,
    NominationRequestModule,
    CommonUtilsModule,
    MessagesModule,
    MessageChannelModule,
    MemberAddressModule,
    CountryModule,
    StallionReasonsModule,
    PaymentMethodsModule,
    MemberInvitationsModule,
    FarmAccessLevelsModule,
  ],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
