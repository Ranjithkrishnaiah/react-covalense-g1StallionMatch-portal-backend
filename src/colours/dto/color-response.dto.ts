import { ApiResponseProperty } from '@nestjs/swagger';

export class ColorResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  colourName: string;

  @ApiResponseProperty()
  colourCode: string;
}
