import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import {
  BreederActivityListSort,
  FarmDashboardFilter,
} from 'src/utils/constants/member-sort';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class BreederActivitySearchOptionsDto extends PageOptionsDto {
  @ApiProperty()
  @IsUUID()
  readonly farmId?: string;

  @ApiProperty({ enum: FarmDashboardFilter })
  @IsEnum(FarmDashboardFilter)
  readonly filterBy?: String;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly fromDate?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly toDate?: string;

  @ApiPropertyOptional({
    enum: BreederActivityListSort,
    default: BreederActivityListSort.LATESTDATE,
  })
  @IsEnum(BreederActivityListSort)
  @IsOptional()
  readonly sortBy?: BreederActivityListSort = BreederActivityListSort.LATESTDATE;
}
