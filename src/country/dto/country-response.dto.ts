import { ApiResponseProperty } from '@nestjs/swagger';

export class CountryResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  countryName: string;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  countryA2Code: string;

  @ApiResponseProperty()
  regionId: number;

  @ApiResponseProperty()
  preferredCurrencyId: string;

  @ApiResponseProperty()
  isDisplay: boolean;
}
