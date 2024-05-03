import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class HypoMatingAdditionalInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  countryName?: string;
}
