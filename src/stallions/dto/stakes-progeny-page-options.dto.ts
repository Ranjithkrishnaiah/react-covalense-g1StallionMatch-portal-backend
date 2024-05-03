import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { StallionStakesProgenySort } from 'src/utils/constants/stallions';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class StakesProgenyPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: StallionStakesProgenySort,
    default: StallionStakesProgenySort.YOB,
  })
  @IsEnum(StallionStakesProgenySort)
  @IsOptional()
  readonly sortBy?: StallionStakesProgenySort = StallionStakesProgenySort.YOB;
}
