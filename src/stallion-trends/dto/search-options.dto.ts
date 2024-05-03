import { ApiResponseProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { StallionListFilter } from 'src/utils/constants/stallions';

export class StallionTrendsSearchOptionDto {
  @ApiResponseProperty()
  @Type(() => Number)
  @IsNumber()
  countryId: number;

  @ApiPropertyOptional({ enum: StallionListFilter })
  @IsEnum(StallionListFilter)
  @IsOptional()
  readonly filterBy?: String;

  @ApiPropertyOptional({ example: '2020-01-01' })
  @IsOptional()
  fromDate: string;

  @ApiPropertyOptional({ example: '2023-01-20' })
  @IsOptional()
  toDate: string;
}
