import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MessagingSort } from 'src/utils/constants/messaging';

export class SearchOptionsDto {
  @ApiPropertyOptional({ enum: MessagingSort })
  @IsEnum(MessagingSort)
  @IsOptional()
  readonly sortBy?: MessagingSort;

  @ApiPropertyOptional()
  @IsOptional()
  readonly search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly filterByFarm?: string;
}
