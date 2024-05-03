import { ApiResponseProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { StallionListFilter } from 'src/utils/constants/stallions';

export class StallionReportSearchOptionDto {
  @ApiResponseProperty()
  @IsUUID()
  stallionId: string;

  @ApiPropertyOptional({ enum: StallionListFilter })
  @IsEnum(StallionListFilter)
  @IsOptional()
  readonly filterBy?: String;

  @ApiPropertyOptional({ example: '2022-11-01' })
  @IsOptional()
  fromDate: string;

  @ApiPropertyOptional({ example: '2022-11-25' })
  @IsOptional()
  toDate: string;
}
