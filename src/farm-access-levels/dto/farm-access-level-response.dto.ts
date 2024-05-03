import { ApiResponseProperty } from '@nestjs/swagger';

export class FarmAccessLevelResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  accessName: string;
}
