import { ApiResponseProperty } from '@nestjs/swagger';

export class AuthStallionInfoResponseDto {
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
  profileRating: number;

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
  startDate: Date;

  @ApiResponseProperty()
  expiryDate: Date;

  @ApiResponseProperty()
  isPromoted: boolean;

  @ApiResponseProperty()
  stallionPromotionId: number;

  @ApiResponseProperty()
  isAutoRenew: boolean;

  @ApiResponseProperty()
  nominationPendingCount: number;

  @ApiResponseProperty()
  nominationStartDate: Date;

  @ApiResponseProperty()
  nominationEndDate: Date;

  @ApiResponseProperty()
  isNominated: boolean;
}
