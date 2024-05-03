import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PageReferrerDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly referrer?: string;
}
