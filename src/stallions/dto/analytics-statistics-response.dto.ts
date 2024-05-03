import { ApiResponseProperty } from '@nestjs/swagger';

export class AnalyticsStatisticsResponseDto {
  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  smSearches: number;

  @ApiResponseProperty()
  twentyTwentyMatches: number;

  @ApiResponseProperty()
  perfectMatches: number;

  @ApiResponseProperty()
  pageViews: number;

  @ApiResponseProperty()
  messages: number;

  @ApiResponseProperty()
  runners: number;

  @ApiResponseProperty()
  winners: number;

  @ApiResponseProperty()
  winnersByRunners: number;

  @ApiResponseProperty()
  maleRunners: number;

  @ApiResponseProperty()
  femaleRunners: number;

  @ApiResponseProperty()
  stakesWinners: number;

  @ApiResponseProperty()
  stakesWinnersByRunners: number;

  @ApiResponseProperty()
  nominations: number;
}
