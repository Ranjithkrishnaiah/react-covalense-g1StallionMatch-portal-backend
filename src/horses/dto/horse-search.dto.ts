import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Order } from 'src/utils/constants/order';

export class HorseSearchDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiPropertyOptional()
  @MinLength(3)
  @IsString()
  @IsOptional()
  readonly horseName?: string;

  @ApiPropertyOptional()
  @MaxLength(1)
  @IsString()
  @IsOptional()
  readonly sex?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly countryId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  readonly farmId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  readonly horseId?: string;
}
