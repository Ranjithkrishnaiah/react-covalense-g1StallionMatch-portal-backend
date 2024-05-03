import { ApiResponseProperty } from '@nestjs/swagger';
import { StateForCountryResponseDto } from './state-for-country-response.dto';

export class CountryWithStateResponseDto {
  @ApiResponseProperty()
  countryId: number;

  @ApiResponseProperty()
  label: string;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  children: StateForCountryResponseDto[] | null;

  @ApiResponseProperty()
  expanded: boolean;
}
