import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionTrendsController } from './stallion-trends.controller';
import { StallionTrendsService } from './stallion-trends.service';
import { SearchStallionMatchModule } from 'src/search-stallion-match/search-stallion-match.module';

@Module({
  imports: [SearchStallionMatchModule],
  controllers: [StallionTrendsController],
  providers: [StallionTrendsService],
  exports: [StallionTrendsService],
})
export class StallionTrendsModule {}
