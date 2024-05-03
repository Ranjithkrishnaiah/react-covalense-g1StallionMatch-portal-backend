import { ApiResponseProperty } from '@nestjs/swagger';

export class MostPopularStallionResponseDto {
  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  horseName: string;

  @ApiResponseProperty()
  profilePic: string;

  @ApiResponseProperty()
  currencyCode: string;

  @ApiResponseProperty()
  currencySymbol: string;

  @ApiResponseProperty()
  fee: number;
}
