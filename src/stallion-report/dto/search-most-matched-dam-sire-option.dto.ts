import { ApiResponseProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { StallionListFilter } from 'src/utils/constants/stallions';

export class SearchMostMatchedDamSireOptionDto extends PageOptionsDto {
  @ApiResponseProperty()
  @IsUUID()
  stallionId: string;

  @ApiPropertyOptional({ enum: StallionListFilter })
  @IsEnum(StallionListFilter)
  @IsOptional()
  filterBy?: String;

  @ApiResponseProperty({ example: '2022-11-01' })
  @IsOptional()
  fromDate: string;

  @ApiResponseProperty({ example: '2022-11-25' })
  @IsOptional()
  toDate: string;
}
