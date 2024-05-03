import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsArray,
  IsOptional,
  IsNotEmpty,
  isNotEmpty,
} from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  emailId: string;

  @ApiProperty()
  @IsOptional()
  fullName: string;

  @ApiProperty()
  @IsOptional()
  billingAddress: object;

  @ApiProperty()
  @IsOptional()
  paymentMethodType: number;

  @ApiProperty()
  @IsOptional()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  currency: number;

  @ApiProperty({
    example: `
        [ {
            "cartId":"",
            "productId": 1,
            "quantity": 5
          }]
        `,
  })
  @IsNotEmpty()
  @IsArray()
  items: Array<{ productId: number; quantity: number; cartId: string }>;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  subTotal: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  couponId: number;

  @ApiProperty()
  @IsNumber()
  discount: number;

  @ApiProperty()
  @IsNumber()
  taxPercentage: number;

  @ApiProperty()
  @IsNumber()
  taxValue: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  postal_code: string;

  @ApiProperty({
    example:`AU`,
  })
  @IsOptional()
 // @IsNotEmpty()
  @IsString()
  country_code: string;

}
