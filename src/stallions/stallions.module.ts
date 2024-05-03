import { Module } from '@nestjs/common';
import { StallionsService } from './stallions.service';
import { StallionsController } from './stallions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stallion } from './entities/stallion.entity';
import { StallionServiceFeesModule } from 'src/stallion-service-fees/stallion-service-fees.module';
import { StallionLocationsModule } from 'src/stallion-locations/stallion-locations.module';
import { HorsesModule } from 'src/horses/horses.module';
import { FarmsModule } from 'src/farms/farms.module';
import { FarmLocationsModule } from 'src/farm-locations/farm-locations.module';
import { StallionTestimonialsModule } from 'src/stallion-testimonials/stallion-testimonials.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { StallionTestimonialMediaModule } from 'src/stallion-testimonial-media/stallion-testimonial-media.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { StallionProfileImageModule } from 'src/stallion-profile-image/stallion-profile-image.module';
import { MediaModule } from 'src/media/media.module';
import { StallionGalleryImageModule } from 'src/stallion-gallery-images/stallion-gallery-image.module';
import { CurrenciesModule } from 'src/currencies/currencies.module';
import { SearchStallionMatchModule } from 'src/search-stallion-match/search-stallion-match.module';
import { AuditService } from 'src/audit/audit.service';
import { AuditModule } from 'src/audit/audit.module';
import { MemberAddressModule } from 'src/member-address/member-address.module';
import { StallionSearchService } from './stallion-search.service';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { PreferedNotificationsModule } from 'src/prefered-notifications/prefered-notifications.module';
import { MailModule } from 'src/mail/mail.module';
import { PageViewModule } from 'src/page-view/page-view.module';
import { StallionsSubscriber } from './stallion.subscriber';
import { SmpActivityTrackerModule } from 'src/smp-activity-tracker/smp-activity-tracker.module';
import { HtmlToPdfService } from 'src/file-uploads/html-to-pdf.service';
import { CountryModule } from 'src/country/country.module';
import { ProductsModule } from 'src/products/products.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MemberSocialShareModule } from 'src/member-social-share/member-social-share.module';
import { StatesModule } from 'src/states/states.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stallion]),
    StallionLocationsModule,
    StallionServiceFeesModule,
    HorsesModule,
    FarmsModule,
    FarmLocationsModule,
    StallionTestimonialsModule,
    StallionTestimonialMediaModule,
    FileUploadsModule,
    MediaModule,
    StallionProfileImageModule,
    StallionGalleryImageModule,
    CurrenciesModule,
    CommonUtilsModule,
    SearchStallionMatchModule,
    AuditModule,
    MemberAddressModule,
    MessageTemplatesModule,
    PreferedNotificationsModule,
    MailModule,
    PageViewModule,
    SmpActivityTrackerModule,
    CountryModule,
    ProductsModule,
    MemberSocialShareModule,
    NotificationsModule,
    StatesModule,
  ],
  controllers: [StallionsController],
  providers: [
    StallionsService,
    StallionSearchService,
    StallionsSubscriber,
    HtmlToPdfService,
  ],
  exports: [StallionsService, StallionSearchService],
})
export class StallionsModule {}
