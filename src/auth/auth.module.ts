import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AnonymousStrategy } from './strategies/anonymous.strategy';
import { MembersModule } from '../members/members.module';
import { ForgotModule } from '../forgot/forgot.module';
import { MailModule } from '../mail/mail.module';
import { FarmsModule } from '../farms/farms.module';
import { MemberFarmsModule } from 'src/member-farms/member-farms.module';
import { StallionShortlistModule } from 'src/stallion-shortlist/stallion-shortlist.module';
import { MemberInvitationsModule } from 'src/member-invitations/member-invitations.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MemberFarmStallionsModule } from 'src/member-farm-stallions/member-farm-stallions.module';
import { CountryModule } from 'src/country/country.module';
import { MemberAddressModule } from 'src/member-address/member-address.module';
import { FarmAccessLevelsModule } from 'src/farm-access-levels/farm-access-levels.module';
import { PreferedNotificationsModule } from 'src/prefered-notifications/prefered-notifications.module';
import { SettingModule } from 'src/setting/setting.module';

@Module({
  imports: [
    MembersModule,
    ForgotModule,
    PassportModule,
    MailModule,
    FarmsModule,
    MemberFarmsModule,
    StallionShortlistModule,
    MemberInvitationsModule,
    CommonUtilsModule,
    MessageTemplatesModule,
    NotificationsModule,
    MemberFarmStallionsModule,
    CountryModule,
    MemberAddressModule,
    FarmAccessLevelsModule,
    PreferedNotificationsModule,
    SettingModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('auth.secret'),
        signOptions: {
          expiresIn: configService.get('auth.expires'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AnonymousStrategy],
  exports: [AuthService],
})
export class AuthModule {}
