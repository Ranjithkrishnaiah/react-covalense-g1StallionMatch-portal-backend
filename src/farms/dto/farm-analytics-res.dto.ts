import { ApiResponseProperty } from '@nestjs/swagger';

export class FarmsAnalyticsResDto {
  @ApiResponseProperty()
  farmId: string;

  @ApiResponseProperty()
  farmPageViews: number;

  @ApiResponseProperty()
  stallionProfileViews: number;

  @ApiResponseProperty()
  mostSearrchedStallion: number;

  @ApiResponseProperty()
  mostViewedProfile: number;

  @ApiResponseProperty()
  mostSavedStallion: number;
}
