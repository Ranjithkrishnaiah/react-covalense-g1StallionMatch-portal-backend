import { ApiResponseProperty } from '@nestjs/swagger';

export class TopMostStallionResponseDto {
  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  profilePic: string;

  @ApiResponseProperty()
  horseName: string;

  @ApiResponseProperty()
  currencyCode: string;

  @ApiResponseProperty()
  currencySymbol: string;

  @ApiResponseProperty()
  fee: number;
}
