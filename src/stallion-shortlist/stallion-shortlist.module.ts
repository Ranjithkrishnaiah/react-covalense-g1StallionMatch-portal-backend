import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionShortlist } from './entities/stallion-shortlist.entity';
import { StallionShortlistService } from './stallion-shortlist.service';
import { StallionShortlistController } from './stallion-shortlist.controller';
import { StallionsModule } from 'src/stallions/stallions.module';
import { CurrenciesModule } from 'src/currencies/currencies.module';
import { StallionShortListSubscriber } from './stallion-shortlist.subscriber';
import { HorsesModule } from 'src/horses/horses.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StallionShortlist]),
    StallionsModule,
    CurrenciesModule,
    HorsesModule,
    CommonUtilsModule,
  ],
  controllers: [StallionShortlistController],
  providers: [StallionShortlistService, StallionShortListSubscriber],
  exports: [StallionShortlistService],
})
export class StallionShortlistModule {}
