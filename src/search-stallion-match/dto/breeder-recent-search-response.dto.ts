import { ApiResponseProperty } from '@nestjs/swagger';

export class BreederRecentSearchRespose {
  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  stallionName: string;

  @ApiResponseProperty()
  mareId: string;

  @ApiResponseProperty()
  mareName: string;

  @ApiResponseProperty()
  perfectMatch: number;

  @ApiResponseProperty()
  createdOn: Date;
}
