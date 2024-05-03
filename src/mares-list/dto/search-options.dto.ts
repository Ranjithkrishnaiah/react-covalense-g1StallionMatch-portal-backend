import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Order } from 'src/utils/constants/order';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { sortBy } from './sortby';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiProperty()
  @IsUUID()
  readonly farmId?: string;

  @ApiPropertyOptional({ enum: sortBy, default: sortBy.name })
  @IsEnum(sortBy)
  @IsOptional()
  readonly sortBy?: sortBy = sortBy.name;

  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;
}
