import { ApiResponseProperty } from '@nestjs/swagger';

export class CurrencyResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  currencyName: string;

  @ApiResponseProperty()
  currencyCode: string;

  @ApiResponseProperty()
  currencySymbol: string;
}
