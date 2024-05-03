import { Module } from '@nestjs/common';
import { StallionLocationsService } from './stallion-locations.service';
import { StallionLocationsController } from './stallion-locations.controller';
import { StallionLocation } from './entities/stallion-location.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([StallionLocation])],
  controllers: [StallionLocationsController],
  providers: [StallionLocationsService],
  exports: [StallionLocationsService],
})
export class StallionLocationsModule {}
