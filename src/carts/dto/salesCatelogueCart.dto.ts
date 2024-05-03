import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class SalesCatelogueCartDto {
  @ApiProperty({ nullable: true })
  @IsOptional()
  fullName: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty()
  @IsNotEmpty()
  location: number;

  @ApiProperty()
  @IsNotEmpty()
  sales: Array<number>;

  @ApiProperty()
  @IsNotEmpty()
  lots: Array<number>;

  @ApiProperty({ nullable: true })
  @IsOptional()
  cartId: string;

  @ApiProperty()
  @IsOptional()
  price: number;
}
