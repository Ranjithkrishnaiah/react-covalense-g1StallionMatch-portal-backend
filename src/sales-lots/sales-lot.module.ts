import { Module } from '@nestjs/common';
import { SalesLotService } from './sales-lot.service';
import { SalesLotController } from './sales-lot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesLot } from './entities/sales-lot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalesLot])],
  controllers: [SalesLotController],
  providers: [SalesLotService],
})
export class SalesLotModule {}
