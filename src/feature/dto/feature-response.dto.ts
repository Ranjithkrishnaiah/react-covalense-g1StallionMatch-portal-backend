import { ApiResponseProperty } from '@nestjs/swagger';

export class FeatureResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  featureName: string;
}
