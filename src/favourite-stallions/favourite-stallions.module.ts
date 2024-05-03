import { Module } from '@nestjs/common';
import { FavouriteStallionsService } from './favourite-stallions.service';
import { FavouriteStallionsController } from './favourite-stallions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavouriteStallion } from './entities/favourite-stallion.entity';
import { StallionsModule } from 'src/stallions/stallions.module';
import { AuditModule } from 'src/audit/audit.module';
import { FavouriteStallionSubscriber } from './favourite-stallion.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavouriteStallion]),
    StallionsModule,
    AuditModule,
  ],
  controllers: [FavouriteStallionsController],
  providers: [FavouriteStallionsService, FavouriteStallionSubscriber],
  exports: [FavouriteStallionsService],
})
export class FavouriteStallionsModule {}
