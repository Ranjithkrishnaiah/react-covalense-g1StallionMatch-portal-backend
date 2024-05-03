import { Module } from '@nestjs/common';
import { NotificationTypesService } from './notification-types.service';
import { NotificationTypesController } from './notification-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationType } from './entities/notification-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationType])],
  controllers: [NotificationTypesController],
  providers: [NotificationTypesService],
  exports: [NotificationTypesService],
})
export class NotificationTypeModule {}
