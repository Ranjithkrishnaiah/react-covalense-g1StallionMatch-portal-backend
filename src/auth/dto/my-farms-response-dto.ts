import { ApiResponseProperty } from '@nestjs/swagger';

export class MyFarmsResponseDto {
  @ApiResponseProperty()
  farmId: string;

  @ApiResponseProperty()
  farmName: string;

  @ApiResponseProperty()
  url: string;

  @ApiResponseProperty()
  isActive: boolean;

  @ApiResponseProperty()
  countryName: string;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  stateName: string;

  @ApiResponseProperty()
  isFamOwner: boolean;

  @ApiResponseProperty()
  accessLevel: string;
}
