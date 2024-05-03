import { Module } from '@nestjs/common';
import { ReportProductItemsService } from './report-product-items.service';
import { ReportProductItemsController } from './report-product-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportProductItem } from './entities/report-product-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportProductItem])],
  controllers: [ReportProductItemsController],
  providers: [ReportProductItemsService],
  exports: [ReportProductItemsService],
})
export class ReportProductItemsModule {}
