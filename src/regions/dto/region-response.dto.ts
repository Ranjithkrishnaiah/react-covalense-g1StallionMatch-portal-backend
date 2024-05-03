import { ApiResponseProperty } from '@nestjs/swagger';

export class RegionResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  regionName: string;
}
