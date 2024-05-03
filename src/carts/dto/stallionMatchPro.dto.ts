import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class StallionMatchProCartDto {
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
  @IsUUID()
  mareId: string;

  @ApiProperty()
  @IsOptional()
  stallions: Array<string>;

  @ApiProperty()
  @IsOptional()
  locations: Array<string>;

  @ApiProperty({ nullable: true })
  @IsOptional()
  cartId: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  selectedpriceRange: string;

  @ApiProperty({default:false})
  @IsOptional()
  isIncludePrivateFee: boolean;

  @ApiProperty()
  @IsNumber()
  cartCurrencyId: number;
  
}
