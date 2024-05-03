import { ApiResponseProperty } from '@nestjs/swagger';

export class SearchSireNameResponse {
  @ApiResponseProperty()
  horseId: string;

  @ApiResponseProperty()
  horseName: string;

  @ApiResponseProperty()
  yob: number;

  @ApiResponseProperty()
  countryCode: string;
}
