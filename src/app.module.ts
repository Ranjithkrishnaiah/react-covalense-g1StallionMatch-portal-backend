import { MailerModule } from '@nestjs-modules/mailer';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderResolver } from 'nestjs-i18n';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import { I18nJsonParser } from 'nestjs-i18n/dist/parsers/i18n.json.parser';
import * as path from 'path';
import { ActivitiesModule } from './activities/activity.module';
import { AuthModule } from './auth/auth.module';
import { CartProductModule } from './cart-product/cart-product.module';
import { CartsModule } from './carts/carts.module';
import { CategoriesModule } from './categories/categories.module';
import { ColoursModule } from './colours/colours.module';
import { CommonUtilsModule } from './common-utils/common-utils.module';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import fileConfig from './config/file.config';
import mailConfig from './config/mail.config';
import { ContactusModule } from './contactus/contactus.module';
import { CountryModule } from './country/country.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { CurrencyRateModule } from './currency-rates/currency-rate.module';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { FarmAccessLevelsModule } from './farm-access-levels/farm-access-levels.module';
import { FarmsModule } from './farms/farms.module';
import { FavouriteBroodmareSiresModule } from './favourite-broodmare-sires/favourite-broodmare-sires.module';
import { FavouriteFarmsModule } from './favourite-farms/favourite-farms.module';
import { FavouriteStallionsModule } from './favourite-stallions/favourite-stallions.module';
import { FeatureModule } from './feature/feature.module';
import { FileUploadsModule } from './file-uploads/file-uploads.module';
import { ForgotModule } from './forgot/forgot.module';
import { HomeTestimonialModule } from './home-testimonial/home-testimonial.module';
import { HorseTypesModule } from './horse-types/horse-types.module';
import { MailConfigService } from './mail/mail-config.service';
import { MailModule } from './mail/mail.module';
import { MaresListInfoModule } from './mare-list-info/mare-list-info.module';
import { MareRequestsModule } from './mare-requests/mare-requests.module';
import { MaresListModule } from './mares-list/mares-list.module';
import { MediaModule } from './media/media.module';
import { MemberAddressModule } from './member-address/member-address.module';
import { MemberInvitationsModule } from './member-invitations/member-invitations.module';
import { MemberMaresModule } from './member-mares/member-mares.module';
import { MemberPaytypeAccessModule } from './member-payment-access/member-paytype-access.module';
import { MembersModule } from './members/members.module';
import { MessageTemplatesModule } from './message-templates/message-templates.module';
import { MessageTypesModule } from './message-types/message-types.module';
import { MessagesModule } from './messages/messages.module';
import { NominationRequestModule } from './nomination-request/nomination-request.module';
import { NotificationTypeModule } from './notification-types/notification-types.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrderTransactionModule } from './order-transaction/order-transaction.module';
import { OrderModule } from './orders/orders.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { PaymentStatusModule } from './payment-status/payment-status.module';
import { PreferedNotificationsModule } from './prefered-notifications/prefered-notifications.module';
import { ProductsModule } from './products/products.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { RegionsModule } from './regions/regions.module';
import { RegisterInterestModule } from './register-interests/register-interest.module';
import { RoleModule } from './role/role.module';
import { RunnerModule } from './runner/runner.module';
import { SearchStallionMatchModule } from './search-stallion-match/search-stallion-match.module';
import { StallionNominationsModule } from './stallion-nominations/stallion-nominations.module';
import { StallionPromotionModule } from './stallion-promotions/stallion-promotion.module';
import { StallionReasonsModule } from './stallion-reasons/stallion-reasons.module';
import { StallionRequestsModule } from './stallion-requests/stallion-requests.module';
import { StallionShortlistModule } from './stallion-shortlist/stallion-shortlist.module';
import { StallionTestimonialsModule } from './stallion-testimonials/stallion-testimonials.module';
import { StallionTrendsModule } from './stallion-trends/stallion-trends.module';
import { StallionsModule } from './stallions/stallions.module';
import { StatesModule } from './states/states.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MessageMediaModule } from './message-media/message-media.module';
import { SalesLotModule } from './sales-lots/sales-lot.module';
import { SalesModule } from './sales/sales.module';
import { StallionReportModule } from './stallion-report/stallion-report.module';

import { ScheduleModule } from '@nestjs/schedule';
import { ActivityModule } from './activity-module/activity.module';
import { AuditModule } from './audit/audit.module';
import { FarmAuditModule } from './audit/farm-audit/farm-audit.module';
import { StallionAuditModule } from './audit/stallion-audit/stallion-audit.module';
import { JwtMiddleware } from './auth/middlewares/jwt.middleware';
import { BreederReportModule } from './breeder-report/breeder-report.module';
import { HorseProfileImageModule } from './horse-profile-image/horse-profile-image.module';
import { JobsSchedularModule } from './jobs-schedular/jobs-schedular.module';
import { MailPreviewModule } from './mail-preview/mail-preview.module';
import { MarketingPageHomeModule } from './marketing-page-home/marketing-page-home.module';
import { MemberSocialShareModule } from './member-social-share/member-social-share.module';
import { MiddleWare } from './middleware/middleware';
import { NominationPricingModule } from './nomination-pricing/nomination-pricing.module';
import { OrderReportModule } from './order-report/order-report.module';
import { OrderStatusModule } from './order-status/order-status.module';
import { PageViewModule } from './page-view/page-view.module';
import { RaceHorseModule } from './race-horse/race-horse.module';
import { ReportProductItemsModule } from './report-product-items/report-product-items.module';
import { ReportTemplatesModule } from './report-templates/report-templates.module';
import { SettingModule } from './setting/setting.module';
import { MemberInterceptor } from './smp-activity-tracker/member.interceptor';
import { SmpActivityTrackerModule } from './smp-activity-tracker/smp-activity-tracker.module';
import { SocialShareTypeModule } from './social-share-types/social-share-type.module';
import { AdminPageSettingsModule } from './admin-page-settings/admin-page-settings.module';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MemberInterceptor,
    },
    FarmAuditModule,
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, appConfig, mailConfig, fileConfig],
      envFilePath: ['.env'],
    }),
    MulterModule.register({
      dest: './files',
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    MailerModule.forRootAsync({
      useClass: MailConfigService,
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('app.fallbackLanguage'),
        parserOptions: {
          path: path.join(
            configService.get('app.workingDirectory'),
            'src',
            'i18n',
            'translations',
          ),
        },
      }),
      parser: I18nJsonParser,
      inject: [ConfigService],
      resolvers: [new HeaderResolver(['x-custom-lang'])],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src/uploads/Mares_List'),
      serveRoot: '/api/download/mareslist',
    }),
    ScheduleModule.forRoot(),
    MembersModule,
    CountryModule,
    AuthModule,
    ForgotModule,
    MailModule,
    FarmsModule,
    StatesModule,
    ColoursModule,
    StallionsModule,
    RegionsModule,
    CurrenciesModule,
    HomeTestimonialModule,
    FavouriteFarmsModule,
    FavouriteStallionsModule,
    MemberAddressModule,
    StallionRequestsModule,
    StallionTestimonialsModule,
    FarmAccessLevelsModule,
    CommonUtilsModule,
    NotificationsModule,
    StallionShortlistModule,
    HorseTypesModule,
    MemberInvitationsModule,
    StallionNominationsModule,
    RegisterInterestModule,
    FileUploadsModule,
    CategoriesModule,
    ProductsModule,
    CartsModule,
    StallionPromotionModule,
    StallionReasonsModule,
    FeatureModule,
    MemberMaresModule,
    MareRequestsModule,
    MaresListInfoModule,
    FavouriteBroodmareSiresModule,
    CartProductModule,
    MediaModule,
    ActivitiesModule,
    MaresListModule,
    MessageTemplatesModule,
    CurrencyRateModule,
    MessagesModule,
    MessageTypesModule,
    PaymentMethodsModule,
    PaymentStatusModule,
    OrderModule,
    OrderTransactionModule,
    NominationRequestModule,
    ContactusModule,
    PreferedNotificationsModule,
    NotificationTypeModule,
    SearchStallionMatchModule,
    PromoCodesModule,
    StallionTrendsModule,
    RunnerModule,
    RoleModule,
    AuditModule,
    MemberPaytypeAccessModule,
    SalesModule,
    SalesLotModule,
    MessageMediaModule,
    StallionReportModule,
    EventEmitterModule.forRoot(),
    FarmAuditModule,
    StallionAuditModule,
    AuditModule,
    BreederReportModule,
    EventEmitterModule.forRoot(),
    PageViewModule,
    JobsSchedularModule,
    SmpActivityTrackerModule,
    OrderReportModule,
    OrderStatusModule,
    ActivityModule,
    ReportTemplatesModule,
    MailPreviewModule,
    SocialShareTypeModule,
    MemberSocialShareModule,
    HorseProfileImageModule,
    SettingModule,
    ReportProductItemsModule,
    RaceHorseModule,
    NominationPricingModule,
    MarketingPageHomeModule,
    AdminPageSettingsModule,
  ],
  exports: [FarmAuditModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware, MiddleWare).forRoutes('*');
  }
}
