import { Module } from '@nestjs/common';
import { StallionReasonsService } from './stallion-reasons.service';
import { StallionReasonsController } from './stallion-reasons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionReason } from './entities/stallion-reasons.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StallionReason])],
  controllers: [StallionReasonsController],
  providers: [StallionReasonsService],
  exports: [StallionReasonsService],
})
export class StallionReasonsModule {}
