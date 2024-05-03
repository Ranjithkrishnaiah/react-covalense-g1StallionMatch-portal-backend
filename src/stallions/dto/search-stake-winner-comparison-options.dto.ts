import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { StakesWinnerComparisionSort } from 'src/utils/constants/stallions';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchStakeWinnerComparisonOptionsDto extends PageOptionsDto {
  @ApiProperty()
  @IsUUID()
  readonly stallionId?: string;

  @ApiProperty()
  @IsUUID()
  readonly mareId?: string;

  @ApiPropertyOptional({
    enum: StakesWinnerComparisionSort,
    default: StakesWinnerComparisionSort.SIMILARITYSCORE,
  })
  @IsEnum(StakesWinnerComparisionSort)
  @IsOptional()
  readonly sortBy?: StakesWinnerComparisionSort =
    StakesWinnerComparisionSort.SIMILARITYSCORE;
}
