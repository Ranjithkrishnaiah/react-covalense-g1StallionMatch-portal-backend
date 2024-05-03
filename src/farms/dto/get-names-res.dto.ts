import { ApiResponseProperty } from '@nestjs/swagger';

export class GetNamesResDto {
  @ApiResponseProperty()
  farmId: string;

  @ApiResponseProperty()
  farmName: string;
}
