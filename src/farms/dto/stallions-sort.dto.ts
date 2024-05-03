import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import {
  StallionListSort,
  StallionListFilter,
} from 'src/utils/constants/stallions';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ToBoolean } from 'src/utils/to-boolean';

export class stallionsSortDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: StallionListSort,
    default: StallionListSort.ALPHABETICAL,
  })
  @IsEnum(StallionListSort)
  @IsOptional()
  readonly sortBy?: StallionListSort = StallionListSort.ALPHABETICAL;

  @ApiPropertyOptional({ enum: StallionListFilter })
  @IsEnum(StallionListFilter)
  @IsOptional()
  readonly filterBy?: String;

  @ApiPropertyOptional({ example: 'yyyy-mm-dd' })
  @IsOptional()
  readonly fromDate?: Date;

  @ApiPropertyOptional({ example: 'yyyy-mm-dd' })
  @IsOptional()
  readonly toDate?: Date;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly mostSearched?: boolean;
}
