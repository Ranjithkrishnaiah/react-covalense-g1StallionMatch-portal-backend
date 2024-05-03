import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Order } from 'src/utils/constants/order';

export class footerSearchDto {

  @ApiProperty()
  @Type(() => String)
  @MinLength(3)
  @IsString()
  readonly keyWord?: string;
}
