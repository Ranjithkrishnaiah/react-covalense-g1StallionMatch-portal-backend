import { ApiResponseProperty } from '@nestjs/swagger';

export class AuthFarmsResponseDto {
  @ApiResponseProperty()
  farmId?: string;

  @ApiResponseProperty()
  farmName?: string;

  @ApiResponseProperty()
  isActive?: boolean;

  @ApiResponseProperty()
  profilePic?: string;

  @ApiResponseProperty()
  countryName?: string;

  @ApiResponseProperty()
  countryCode?: string;

  @ApiResponseProperty()
  stateName?: string;

  @ApiResponseProperty()
  isFamOwner?: boolean;

  @ApiResponseProperty()
  accessLevel?: string;
}
