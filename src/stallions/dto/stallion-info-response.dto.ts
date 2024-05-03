import { ApiResponseProperty } from '@nestjs/swagger';

export class StallionInfoResponseDto {
  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  profilePic: string;

  @ApiResponseProperty()
  url: string;

  @ApiResponseProperty()
  height: string;

  @ApiResponseProperty()
  yearToStud: number;

  @ApiResponseProperty()
  yearToRetired: number;

  @ApiResponseProperty()
  colourId: number;

  @ApiResponseProperty()
  colourName: string;

  @ApiResponseProperty()
  overview: string;

  @ApiResponseProperty()
  horseName: string;

  @ApiResponseProperty()
  yob: number;

  @ApiResponseProperty()
  farmId: string;

  @ApiResponseProperty()
  farmName: string;

  @ApiResponseProperty()
  currencyCode: string;

  @ApiResponseProperty()
  currencySymbol: string;

  @ApiResponseProperty()
  feeYear: number;

  @ApiResponseProperty()
  currencyId: number;

  @ApiResponseProperty()
  fee: number;

  @ApiResponseProperty()
  isPrivateFee: boolean;

  @ApiResponseProperty()
  countryName: string;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  stateName: string;

  @ApiResponseProperty()
  sireName: string;

  @ApiResponseProperty()
  sireYob: number;

  @ApiResponseProperty()
  sireCountryCode: string;

  @ApiResponseProperty()
  damName: string;

  @ApiResponseProperty()
  damYob: number;

  @ApiResponseProperty()
  damCountryCode: string;

  @ApiResponseProperty()
  isPromoted: boolean;
}
