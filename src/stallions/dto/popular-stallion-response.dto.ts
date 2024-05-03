import { ApiResponseProperty } from '@nestjs/swagger';

export class PopularStallionResponseDto {
  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  searchCount: number;

  @ApiResponseProperty()
  url: string;

  @ApiResponseProperty()
  profilePic: string;

  @ApiResponseProperty()
  yearToStud: number;

  @ApiResponseProperty()
  yearToRetired: number;

  @ApiResponseProperty()
  overview: string;

  @ApiResponseProperty()
  galleryImage: string;

  @ApiResponseProperty()
  farmName: string;

  @ApiResponseProperty()
  horseName: string;

  @ApiResponseProperty()
  yob: number;

  @ApiResponseProperty()
  currencyCode: string;

  @ApiResponseProperty()
  currencySymbol: string;

  @ApiResponseProperty()
  fee: number;

  @ApiResponseProperty()
  feeYear: number;

  @ApiResponseProperty()
  isPrivateFee: string;

  @ApiResponseProperty()
  countryName: string;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  stateName: string;

  @ApiResponseProperty()
  isPromoted: number;
}
