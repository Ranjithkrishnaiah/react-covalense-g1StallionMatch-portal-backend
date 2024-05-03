import { ApiResponseProperty } from '@nestjs/swagger';

export class FarmInfoResDto {
  @ApiResponseProperty()
  farmId: string;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  website: string;

  @ApiResponseProperty()
  image: string;

  @ApiResponseProperty()
  url: string;

  @ApiResponseProperty()
  overview: string;

  @ApiResponseProperty()
  farmName: string;

  @ApiResponseProperty()
  countryId: number;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  stateId: number;

  @ApiResponseProperty()
  stateName: string;
}
