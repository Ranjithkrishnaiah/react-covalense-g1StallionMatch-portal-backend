import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { CoreSearchOptionsDto } from './core-search-options.dto';

export class GuestSearchOptionsDto extends CoreSearchOptionsDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  stallionIds?: string;
}
