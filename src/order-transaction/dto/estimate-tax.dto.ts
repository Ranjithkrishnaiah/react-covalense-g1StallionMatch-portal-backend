import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsArray,
  IsOptional,
  IsNotEmpty,
  isNotEmpty,
  IsObject,
} from 'class-validator';

export class EstimateTaxDto {

  @ApiProperty({
    example:`AU`,
  })
  @IsNotEmpty()
  @IsString()
  country_code: string;

  @ApiProperty({
    example:`3685`,
  })
  @IsOptional()
  @IsString()
  postal_code: string;
  

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  currency: number;

  @ApiProperty({
    example: `[{"amount": 1000,"reference": "L1"}]`,
  })
  @IsNotEmpty()
  @IsArray()
  items: Array<{ amount: number; reference: string }>;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  total: number;

  
}
