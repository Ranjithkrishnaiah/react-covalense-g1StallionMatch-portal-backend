import { ApiResponseProperty } from '@nestjs/swagger';

export class AuthSmSearchResponseDto {
  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  mareId: string;

  @ApiResponseProperty()
  isTwentytwentyMatch: boolean;

  @ApiResponseProperty()
  isPerfectMatch: boolean;
}
