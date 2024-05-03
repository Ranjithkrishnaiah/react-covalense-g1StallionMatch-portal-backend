import { ApiResponseProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import {
  StallionActivitySort,
  StallionMatchActivityFilter,
} from 'src/utils/constants/stallions';

export class FarmStallionMatchedActivitySearchOptionDto {
  @ApiResponseProperty()
  @IsUUID()
  farmId: string;

  @ApiPropertyOptional({ enum: StallionMatchActivityFilter })
  @IsEnum(StallionMatchActivityFilter)
  @IsOptional()
  readonly filterBy?: String;

  @ApiPropertyOptional({ example: '2020-01-01' })
  @IsOptional()
  fromDate: string;

  @ApiPropertyOptional({ example: '2023-01-20' })
  @IsOptional()
  toDate: string;

  @ApiPropertyOptional({
    enum: StallionActivitySort,
    default: StallionActivitySort.NAME,
  })
  @IsEnum(StallionActivitySort)
  @IsOptional()
  readonly sortBy?: StallionActivitySort = StallionActivitySort.NAME;
}
