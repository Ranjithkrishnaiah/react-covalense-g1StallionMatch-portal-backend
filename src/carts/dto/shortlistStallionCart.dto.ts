import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsNumber } from 'class-validator';

export class ShortlistStallionCartDto {
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

  @ApiProperty({ nullable: true })
  @IsOptional()
  cartId: string;
}
