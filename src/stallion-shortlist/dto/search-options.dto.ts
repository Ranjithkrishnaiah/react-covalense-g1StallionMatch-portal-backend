import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { CoreSearchOptionsDto } from './core-search-options.dto';

export class SearchOptionsDto extends CoreSearchOptionsDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  stallionIds?: string;
}
