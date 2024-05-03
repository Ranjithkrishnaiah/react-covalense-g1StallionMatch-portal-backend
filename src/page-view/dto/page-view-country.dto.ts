import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PageViewCountryDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly countryName?: string;
}
