import { ApiResponseProperty } from '@nestjs/swagger';

export class YearListResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  value: number;
}
