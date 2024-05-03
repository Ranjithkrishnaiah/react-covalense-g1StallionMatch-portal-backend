import { ApiResponseProperty } from '@nestjs/swagger';

export class StateForCountryResponseDto {
  @ApiResponseProperty()
  countryId: number;

  @ApiResponseProperty()
  stateId: number;

  @ApiResponseProperty()
  label: string;
}
