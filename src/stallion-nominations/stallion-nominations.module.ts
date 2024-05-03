import { Module } from '@nestjs/common';
import { StallionNominationService } from './stallion-nominations.service';
import { StallionNominationController } from './stallion-nominations.controller';
import { StallionNomination } from './entities/stallion-nomination.entity';
import { StallionsModule } from 'src/stallions/stallions.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([StallionNomination]), StallionsModule],
  controllers: [StallionNominationController],
  providers: [StallionNominationService],
  exports: [StallionNominationService],
})
export class StallionNominationsModule {}
