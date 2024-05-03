import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    example: `
    [ {
        "cartId":"",
        "productId": 1,
        "quantity": 5
      },
      {
        "cartId":"",
        "productId": 2,
        "quantity": 2
      }]
    `,
  })
  @IsArray()
  items: Array<{ productId: number; quantity: number; cartId: string }>;

  @ApiProperty()
  @IsNotEmpty()
  cartSessionId: string;

  @ApiProperty()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNumber()
  countryId: number;

  @ApiProperty()
  @IsString()
  postalCode: string;

  memberId?: number | null;
  createdBy?: number | null;
}
