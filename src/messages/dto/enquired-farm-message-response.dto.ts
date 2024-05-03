import { ApiResponseProperty } from '@nestjs/swagger';

export class EnquiredFarmMessagesResponseDto {
  @ApiResponseProperty()
  farmUuid: string;

  @ApiResponseProperty()
  farmName: string;
}
