import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ToBoolean } from 'src/utils/to-boolean';
export class FeeRangeSearchDto extends PageOptionsDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  readonly location?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  readonly currency?: number;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly priceRange?: string;

  @ApiProperty()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  readonly includePrivateFee?: boolean;
}
