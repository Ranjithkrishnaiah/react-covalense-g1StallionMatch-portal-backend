import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class additionalOptionDto {
  @ApiPropertyOptional()
  @IsOptional()
  countryName?: string;
}