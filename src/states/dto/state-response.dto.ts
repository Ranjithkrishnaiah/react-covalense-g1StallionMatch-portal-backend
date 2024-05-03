import { ApiResponseProperty } from '@nestjs/swagger';
import { CountryResponseDto } from 'src/country/dto/country-response.dto';

export class StateResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  stateName: string;

  @ApiResponseProperty()
  stateCode: string;

  @ApiResponseProperty()
  countryId: number;

  @ApiResponseProperty()
  country: CountryResponseDto;
}
