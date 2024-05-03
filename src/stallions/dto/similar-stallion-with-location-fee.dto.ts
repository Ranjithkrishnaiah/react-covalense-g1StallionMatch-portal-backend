import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Order } from 'src/utils/constants/order';

export class SimilarStallionWithLocationFeeDto {
  @ApiProperty()
  @Type(() => String)
  stallionId: string;

  @ApiProperty()
  @Type(() => Number)
  countryId: number;

  @ApiProperty()
  @Type(() => Number)
  currencyId: number;

  @ApiProperty()
  @Type(() => String)
  @IsString()
  priceRange: string;

  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  order?: Order = Order.ASC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 20;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
