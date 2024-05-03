import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsNumber } from 'class-validator';

export class StallionAfinityCartDto {
  @ApiProperty({ nullable: true })
  @IsOptional()
  fullName: string;

  @ApiProperty({ nullable: true })
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty({ nullable: true })
  @IsUUID()
  stallionId: string;

  @ApiProperty()
  @IsOptional()
  farms: Array<string>;

  @ApiProperty({ nullable: true })
  @IsOptional()
  cartId: string;
}
