import { Module } from '@nestjs/common';
import { FavouriteFarmsService } from './favourite-farms.service';
import { FavouriteFarmsController } from './favourite-farms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteFarm } from './entities/favourite-farm.entity';
import { FarmsModule } from 'src/farms/farms.module';
import { FavouriteFarmSubscriber } from './favourite-farms.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([FavouriteFarm]), FarmsModule],
  controllers: [FavouriteFarmsController],
  providers: [FavouriteFarmsService, FavouriteFarmSubscriber],
  exports: [FavouriteFarmsService],
})
export class FavouriteFarmsModule {}
