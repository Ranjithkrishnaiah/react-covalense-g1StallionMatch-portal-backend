import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { NotificationsSort } from 'src/utils/constants/messaging';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: NotificationsSort,
    default: NotificationsSort.RECENT,
  })
  @IsEnum(NotificationsSort)
  @IsOptional()
  readonly sortBy?: NotificationsSort = NotificationsSort.RECENT;
}
