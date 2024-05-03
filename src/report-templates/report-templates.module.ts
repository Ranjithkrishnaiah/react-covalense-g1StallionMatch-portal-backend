import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { FarmsModule } from 'src/farms/farms.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesModule } from 'src/horses/horses.module';
import { StallionsModule } from 'src/stallions/stallions.module';
import { HtmlToPdfService } from './html-to-pdf.service';
import { ReportTemplatesCommonService } from './report-templates-common.service';
import { ReportTemplatesController } from './report-templates.controller';
import { ReportTemplatesService } from './report-templates.service';
import { ReportStallionShortlistService } from './report-stallion-shortlist.service';
import { ReportBroodmareAffinityService } from './report-broodmare-affinity.service';
import { ReportSalesCatelogueService } from './report-sales-catelogue.service';
import { ReportStallionAffinityService } from './report-stallion-affinity.service';
//import { OrderTransactionModule } from 'src/order-transaction/order-transaction.module';
import { SalesModule } from 'src/sales/sales.module';
import { CountryModule } from 'src/country/country.module';
import { OrderReportModule } from 'src/order-report/order-report.module';
import { ReportRaceHorseService } from './report-race-horse.service';
import { RaceHorseModule } from 'src/race-horse/race-horse.module';

@Module({
  imports: [
    HorsesModule,
    CommonUtilsModule,
    FileUploadsModule,
    StallionsModule,
    FarmsModule,
    // OrderTransactionModule,
    SalesModule,
    CountryModule,
    OrderReportModule,
    RaceHorseModule,
    TypeOrmModule.forFeature([Horse]),
  ],
  controllers: [ReportTemplatesController],
  providers: [
    ReportTemplatesService,
    HtmlToPdfService,
    ReportTemplatesCommonService,
    ReportStallionShortlistService,
    ReportBroodmareAffinityService,
    ReportSalesCatelogueService,
    ReportStallionAffinityService,
    ReportRaceHorseService,
  ],
  exports: [ReportTemplatesService],
})
export class ReportTemplatesModule {}
