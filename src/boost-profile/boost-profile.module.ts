import { Module } from '@nestjs/common';
import { BoostProfileService } from './boost-profile.service';
import { BoostProfile } from './entities/boost-profile.entity';
import { BoostStallion } from './entities/boost-stallion.entity';
import { BoostUserLocation } from './entities/boost-user-location.entity';
import { BoostSearchedDamSire } from './entities/boost-searched-damsire.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoostStallionService } from './boost-stallion.service';
import { BoostUserLocationService } from './boost-user-location.service';
import { BoostSearchedDamsireService } from './boost-searched-damsire.service';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MessageChannelModule } from 'src/message-channel/message-channel.module';
import { MessageRecipientModule } from 'src/message-recepient/message-recipients.module';
import { PreferedNotificationsModule } from 'src/prefered-notifications/prefered-notifications.module';
import { MembersModule } from 'src/members/members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoostProfile,
      BoostStallion,
      BoostUserLocation,
      BoostSearchedDamSire,
    ]),
    MessageTemplatesModule,
    NotificationsModule,
    MessageChannelModule,
    MessageRecipientModule,
    PreferedNotificationsModule,
    MembersModule,
  ],
  //controllers: [OrderReportController],
  providers: [
    BoostProfileService,
    BoostStallionService,
    BoostUserLocationService,
    BoostSearchedDamsireService,
  ],
  exports: [
    BoostProfileService,
    BoostStallionService,
    BoostUserLocationService,
    BoostSearchedDamsireService,
  ],
})
export class BoostProfileModule {}
