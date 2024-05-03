import { ApiResponseProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { StallionListFilter } from 'src/utils/constants/stallions';

export class SearchMatchedMareDto extends PageOptionsDto {
  @ApiResponseProperty()
  @IsUUID()
  farmId: string;

  @ApiPropertyOptional({ enum: StallionListFilter })
  @IsEnum(StallionListFilter)
  @IsOptional()
  filterBy?: String;

  @ApiPropertyOptional({ example: '2020-01-01' })
  @IsOptional()
  fromDate: string;

  @ApiPropertyOptional({ example: '2023-01-20' })
  @IsOptional()
  toDate: string;
}
