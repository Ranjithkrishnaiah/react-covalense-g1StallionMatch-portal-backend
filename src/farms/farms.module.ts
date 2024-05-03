import { Module } from '@nestjs/common';
import { FarmsService } from './farms.service';
import { FarmsController } from './farms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farm } from './entities/farm.entity';
import { FarmLocationsModule } from '../farm-locations/farm-locations.module';
import { MemberFarmsModule } from 'src/member-farms/member-farms.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { FarmMediaInfoModule } from 'src/farm-media-info/farm-media-info.module';
import { FarmMediaFilesModule } from 'src/farm-media-files/farm-media-files.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { FarmProfileImageModule } from 'src/farm-profile-image/farm-profile-image.module';
import { FarmGalleryImageModule } from 'src/farm-gallery-images/farm-gallery-image.module';
import { MediaModule } from 'src/media/media.module';
import { CurrenciesModule } from 'src/currencies/currencies.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { FarmMemberPolicyService } from './policies/farm.memberpolicy.service';
import { FarmAccessLevelsModule } from 'src/farm-access-levels/farm-access-levels.module';
import { MailModule } from 'src/mail/mail.module';
import { CountryModule } from 'src/country/country.module';
import { PreferedNotificationsModule } from 'src/prefered-notifications/prefered-notifications.module';
import { PageViewModule } from 'src/page-view/page-view.module';
import { FarmSubscriber } from './farms.subscriber';
import { HorsesService } from 'src/horses/horses.service';
import { HorsesModule } from 'src/horses/horses.module';
import { MemberSocialShareModule } from 'src/member-social-share/member-social-share.module';
import { StatesModule } from 'src/states/states.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Farm]),
    FarmLocationsModule,
    MemberFarmsModule,
    FarmMediaInfoModule,
    FarmMediaFilesModule,
    FarmProfileImageModule,
    FarmGalleryImageModule,
    MediaModule,
    FileUploadsModule,
    CommonUtilsModule,
    CurrenciesModule,
    NotificationsModule,
    MessageTemplatesModule,
    FarmAccessLevelsModule,
    MailModule,
    CountryModule,
    PreferedNotificationsModule,
    PageViewModule,
    HorsesModule,
    MemberSocialShareModule,
    StatesModule,
  ],
  controllers: [FarmsController],
  providers: [FarmsService, FarmMemberPolicyService, FarmSubscriber],
  exports: [FarmsService],
})
export class FarmsModule {}
