import { ApiResponseProperty } from '@nestjs/swagger';

export class SearchStallionNameResponse {
  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  stallionName: string;

  @ApiResponseProperty()
  yob: number;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  sireId: string;

  @ApiResponseProperty()
  sireName: string;

  @ApiResponseProperty()
  sireYob: number;

  @ApiResponseProperty()
  sireCountryCode: string;

  @ApiResponseProperty()
  damId: string;

  @ApiResponseProperty()
  damName: string;

  @ApiResponseProperty()
  damYob: number;

  @ApiResponseProperty()
  damCountryCode: number;
}
