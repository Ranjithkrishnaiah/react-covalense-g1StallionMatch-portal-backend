import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MemberListSort } from 'src/utils/constants/member-sort';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: MemberListSort, default: MemberListSort.ACTIVE })
  @IsEnum(MemberListSort)
  @IsOptional()
  readonly sortBy?: MemberListSort = MemberListSort.ACTIVE;
}
