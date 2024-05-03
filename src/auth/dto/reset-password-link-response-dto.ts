import { ApiResponseProperty } from '@nestjs/swagger';

export class ResetPasswordLinkResponseDto {
  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  fullName: string;
}
