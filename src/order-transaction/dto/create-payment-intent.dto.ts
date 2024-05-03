import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsEmail,
  IsString,
  IsArray,
  IsOptional,
  IsObject,
  IsNotEmpty,
} from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty()
  @IsString()
  emailId: string;

  @ApiProperty()
  @IsNumber()
  currency: number;

  @ApiProperty()
  @IsOptional()
  billingAddress: object;

  @ApiProperty({
    example: `
        [ {
            "cartId":"",
            "productId": 1,
            "quantity": 5
          }]
        `,
  })
  @IsArray()
  items: Array<{ productId: number; quantity: number; cartId: string }>;

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsNumber()
  subTotal: number;

  @ApiProperty()
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
  @IsNotEmpty()
  @IsString()
  country_code: string;

}
