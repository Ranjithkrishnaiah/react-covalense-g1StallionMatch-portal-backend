import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  MinLength,
  MaxLength,
  IsString,
  IsOptional,
} from 'class-validator';

export class AuthRegisterFarmmemberDto {
  @ApiProperty({
    example: 'bWF0dGhld2Vubmlz',
  })
  @IsNotEmpty()
  @IsString()
  hashKey: string;

  @ApiProperty({
    example: 10,
  })
  @IsNumber()
  countryId: number;

  @ApiProperty({
    example: 3685,
  })
  @IsString()
  @IsOptional()
  postcode: string;

  @ApiProperty({
    example: 'bWF0dGhld2Vubmlz',
    minimum: 6,
    maximum: 20,
    description: 'Must contain at least one letter & one number',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
