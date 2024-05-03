import { ApiResponseProperty } from '@nestjs/swagger';

export class GetAllMemberByFarmIdResponseDto {
  @ApiResponseProperty()
  invitationId: number;

  @ApiResponseProperty()
  fullname: string;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  farmId: string;

  @ApiResponseProperty()
  accessLevelId: number;

  @ApiResponseProperty()
  isAccepted: boolean;
}
