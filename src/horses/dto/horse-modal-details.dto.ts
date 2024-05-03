import { ApiResponseProperty } from '@nestjs/swagger';

export class HorseModalResponseDto {
  @ApiResponseProperty()
  horseId: string;

  @ApiResponseProperty()
  horseName: string;

  @ApiResponseProperty()
  yob: number;

  @ApiResponseProperty()
  currencyCode: string;

  @ApiResponseProperty()
  currencySymbol: string;

  @ApiResponseProperty()
  sireId: number;

  @ApiResponseProperty()
  sireName: string;

  @ApiResponseProperty()
  sireYob: number;

  @ApiResponseProperty()
  sireCountryCode: string;

  @ApiResponseProperty()
  damId: number;

  @ApiResponseProperty()
  damName: string;

  @ApiResponseProperty()
  damYob: number;

  @ApiResponseProperty()
  damCountryCode: string;

  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  feeYear: number;

  @ApiResponseProperty()
  imageUrl: string;
}
