import { Module } from '@nestjs/common';
import { MemberAddressService } from './member-address.service';
import { MemberAddressController } from './member-address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberAddress } from './entities/member-address.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { PreferedNotificationsModule } from 'src/prefered-notifications/prefered-notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberAddress]),
    NotificationsModule,
    MessageTemplatesModule,
    PreferedNotificationsModule,
  ],
  controllers: [MemberAddressController],
  providers: [MemberAddressService],
  exports: [MemberAddressService],
})
export class MemberAddressModule {}
