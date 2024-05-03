import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

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

  createdBy?: number | null;
}
