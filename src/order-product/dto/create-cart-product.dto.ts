import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateCartProductDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty({ nullable: true })
  @IsNumber()
  countryId: number;

  @ApiProperty({ nullable: true })
  @IsNumber()
  stateId: number;

  @ApiProperty({ nullable: true })
  @IsString()
  postalCode: string;

  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    example: [
      'AC73010C-A8D2-EC11-B1E6-00155D01EE2B',
      '3426D190-3CD5-EC11-B1E6-00155D01EE2B',
    ],
  })
  @IsNotEmpty()
  items: Array<string>;

  @ApiProperty({ nullable: true })
  @IsString()
  mareId: string;
}
