import { ApiResponseProperty } from '@nestjs/swagger';

export class ValidateLinkResponseDto {
  @ApiResponseProperty()
  fullName: string;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  isMember: boolean;
}
