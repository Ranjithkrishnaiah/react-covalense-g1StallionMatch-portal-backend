import { Module } from '@nestjs/common';
import { BreederReportController } from './breeder-report.controller';
import { FarmsModule } from 'src/farms/farms.module';
import { SearchStallionMatchModule } from 'src/search-stallion-match/search-stallion-match.module';

@Module({
  imports: [FarmsModule, SearchStallionMatchModule],
  controllers: [BreederReportController],
})
export class BreederReportModule {}
