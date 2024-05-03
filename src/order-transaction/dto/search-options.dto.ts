import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MemberMareSort } from 'src/utils/constants/member-mare-sort';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: MemberMareSort, default: MemberMareSort.NAME })
  @IsEnum(MemberMareSort)
  @IsOptional()
  readonly sortBy?: MemberMareSort = MemberMareSort.NAME;
}
