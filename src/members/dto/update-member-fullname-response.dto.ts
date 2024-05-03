import { ApiResponseProperty } from '@nestjs/swagger';

export class UpdateMemberFullnameResponseDto {
  @ApiResponseProperty()
  id?: number;

  @ApiResponseProperty()
  fullName?: string;
}
