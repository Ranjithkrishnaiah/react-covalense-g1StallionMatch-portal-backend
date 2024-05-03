import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CartProductDto {
  @ApiProperty()
  @IsNumber()
  cartId: number;

  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ nullable: true })
  @IsOptional()
  selectedpriceRange: string;

  @ApiProperty({ default: false })
  @IsOptional()
  isIncludePrivateFee: boolean;

  @ApiProperty({ nullable: true })
  @IsOptional()
  CurrencyId: number;

  createdBy?: number | null;
}
