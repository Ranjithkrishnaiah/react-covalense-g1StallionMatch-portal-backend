import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateFeatureDto {
  @ApiProperty({ example: 'text' })
  @IsString()
  featureName: string;

  createdBy?: number | null;
}
