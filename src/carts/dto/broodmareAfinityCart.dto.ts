import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsNumber, IsOptional } from 'class-validator';

export class BroodmareAfinityCartDto {
  @ApiProperty({ nullable: true })
  @IsOptional()
  fullName: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty({ example: [10, 11] })
  @IsNotEmpty()
  locations: Array<number>;

  @ApiProperty({ nullable: true })
  @IsUUID()
  mareId: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  cartId: string;
}
