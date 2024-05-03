import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCartProductDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty({
    example: [
      'AC73010C-A8D2-EC11-B1E6-00155D01EE2B',
      '3426D190-3CD5-EC11-B1E6-00155D01EE2B',
    ],
  })
  @IsNotEmpty()
  items: Array<string>;

  @ApiProperty({ nullable: true })
  @IsOptional()
  cartId: string;
  
  @ApiProperty({ default:false })
  @IsOptional()
  isIncludePrivateFee: boolean;
}
