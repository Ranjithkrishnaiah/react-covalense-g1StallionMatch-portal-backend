import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class LocalBoostCartDto {
  @ApiProperty({ nullable: true })
  @IsOptional()
  fullName: string;

  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty()
  @IsNotEmpty()
  stallions: Array<string>;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  cartId: string;
}
