import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { NotificationsSort } from 'src/utils/constants/messaging';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchOptionsFarmDto extends PageOptionsDto {
  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsUUID()
  farmId: string;

  @ApiPropertyOptional({
    enum: NotificationsSort,
    default: NotificationsSort.RECENT,
  })
  @IsEnum(NotificationsSort)
  @IsOptional()
  readonly sortBy?: NotificationsSort = NotificationsSort.RECENT;
}
