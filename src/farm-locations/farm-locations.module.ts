import { Module } from '@nestjs/common';
import { FarmLocationsService } from './farm-locations.service';
import { FarmLocationsController } from './farm-locations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmLocation } from './entities/farm-location.entity';
import { MessageTemplatesModule } from 'src/message-templates/message-templates.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PreferedNotificationsModule } from 'src/prefered-notifications/prefered-notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FarmLocation]),
    MessageTemplatesModule,
    NotificationsModule,
    PreferedNotificationsModule,
  ],
  controllers: [FarmLocationsController],
  providers: [FarmLocationsService],
  exports: [FarmLocationsService],
})
export class FarmLocationsModule {}
