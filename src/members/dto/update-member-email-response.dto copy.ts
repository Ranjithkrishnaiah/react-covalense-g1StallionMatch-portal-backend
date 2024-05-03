import { ApiResponseProperty } from '@nestjs/swagger';

export class UpdateMemberEmailResponseDto {
  @ApiResponseProperty()
  email?: string;
}
