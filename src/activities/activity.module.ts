import { Module } from '@nestjs/common';
import { ActivitiesService } from './activity.service';
import { ActivitiesController } from './activities.controller';
import { SearchStallionMatchModule } from 'src/search-stallion-match/search-stallion-match.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';

@Module({
  imports: [SearchStallionMatchModule, CommonUtilsModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
})
export class ActivitiesModule {}
