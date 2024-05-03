import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class ExtendedBoostCartDto {
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
  @IsNotEmpty()
  locations: Array<number>;

  @ApiProperty()
  @IsNotEmpty()
  damSireSearchedUsers: Array<string>;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsBoolean()
  isTracked: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  isSearched: boolean;

  @ApiProperty({ nullable: true })
  @IsOptional()
  cartId: string;
}
