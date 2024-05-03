import { Module } from '@nestjs/common';
import { OrderReportService } from './order-report.service';
import { OrderReport } from './entities/order-report.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([OrderReport])],
  providers: [OrderReportService],
  exports: [OrderReportService],
})
export class OrderReportModule { }
