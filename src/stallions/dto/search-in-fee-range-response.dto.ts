import { ApiResponseProperty } from '@nestjs/swagger';

export class SearchInFeeRangeResponseDto {
  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  url: string;

  @ApiResponseProperty()
  yearToStud: number;

  @ApiResponseProperty()
  yearToRetired: number;

  @ApiResponseProperty()
  overview: string;

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
  isPrivateFee: boolean;

  @ApiResponseProperty()
  startDate: Date;

  @ApiResponseProperty()
  endDate: Date;

  @ApiResponseProperty()
  stallionPromotionId: number;

  @ApiResponseProperty()
  isPromoted: boolean;

  @ApiResponseProperty()
  isAutoRenew: boolean;
}
