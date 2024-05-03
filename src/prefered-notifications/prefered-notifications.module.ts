import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferedNotification } from './entities/prefered-notification.entity';
import { PreferedNotificationsController } from './prefered-notifications.controller';
import { PreferedNotificationService } from './prefered-notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([PreferedNotification])],
  controllers: [PreferedNotificationsController],
  providers: [PreferedNotificationService],
  exports: [PreferedNotificationService],
})
export class PreferedNotificationsModule {}
