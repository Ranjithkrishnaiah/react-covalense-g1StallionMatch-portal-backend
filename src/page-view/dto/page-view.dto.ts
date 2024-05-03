import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { StaticPageViewEntityType } from 'src/utils/constants/page-view';

export class PageViewDto {
  @ApiProperty({ enum: StaticPageViewEntityType })
  @IsEnum(StaticPageViewEntityType)
  readonly page?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly referrer?: string;
}
