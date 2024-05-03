import { ApiResponseProperty } from '@nestjs/swagger';

export class SearchDamNameResponse {
  @ApiResponseProperty()
  horseId: string;

  @ApiResponseProperty()
  horseName: string;

  @ApiResponseProperty()
  yob: number;

  @ApiResponseProperty()
  countryCode: string;
}
