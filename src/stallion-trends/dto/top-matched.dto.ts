import { ApiResponseProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { TopMachedSiresSort } from 'src/utils/constants/stallions';

export class TopMatchedSiresDto extends PageOptionsDto {
  @ApiResponseProperty()
  @Type(() => Number)
  @IsNumber()
  countryId: number;

  @ApiPropertyOptional({
    enum: TopMachedSiresSort,
    default: TopMachedSiresSort.NAME,
  })
  @IsEnum(TopMachedSiresSort)
  @IsOptional()
  readonly sortBy?: TopMachedSiresSort = TopMachedSiresSort.NAME;
}
