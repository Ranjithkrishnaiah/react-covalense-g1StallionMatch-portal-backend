import { ApiResponseProperty } from '@nestjs/swagger';

export class ServiceFeeByYearResponseDto {
  @ApiResponseProperty()
  feeYear: number;

  @ApiResponseProperty()
  currencyId: number;

  @ApiResponseProperty()
  fee: number;

  @ApiResponseProperty()
  isPrivateFee: boolean;
}
