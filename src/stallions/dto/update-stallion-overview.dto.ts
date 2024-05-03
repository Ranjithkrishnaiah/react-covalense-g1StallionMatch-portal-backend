import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateStallionOverviewDto {
  @ApiProperty({ example: 'Sample Overview' })
  @IsString()
  overview: string;

  modifiedBy?: number | null;
}
