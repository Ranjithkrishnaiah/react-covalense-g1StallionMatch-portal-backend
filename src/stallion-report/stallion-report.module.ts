import { Module } from '@nestjs/common';
import { SearchStallionMatchModule } from 'src/search-stallion-match/search-stallion-match.module';
import { StallionsModule } from 'src/stallions/stallions.module';
import { StallionReportController } from './stallion-report.controller';

@Module({
  imports: [StallionsModule, SearchStallionMatchModule],
  controllers: [StallionReportController],
})
export class StallionReportModule {}
