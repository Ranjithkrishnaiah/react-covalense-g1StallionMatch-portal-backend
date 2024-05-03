import { ApiResponseProperty } from '@nestjs/swagger';

export class RefreshTokenResponseDto {
  @ApiResponseProperty()
  accessToken: string;

  @ApiResponseProperty()
  refreshToken: string;
}
