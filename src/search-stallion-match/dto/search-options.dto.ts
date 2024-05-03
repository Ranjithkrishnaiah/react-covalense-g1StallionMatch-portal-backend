import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsDateString()
  @IsOptional()
  readonly fromDate?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsDateString()
  @IsOptional()
  readonly toDate?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  readonly countryId?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  readonly limit?: number = 10;
}
