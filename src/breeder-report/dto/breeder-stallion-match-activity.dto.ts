import { ApiPropertyOptional, ApiResponseProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { StallionListFilter } from 'src/utils/constants/stallions';

export class BreederStallionMatchActivityDto {
  @ApiResponseProperty()
  @IsUUID()
  farmId: string;

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
