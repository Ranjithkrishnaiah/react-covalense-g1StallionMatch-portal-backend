import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreaMareList {
  @ApiProperty({ example: 'AETHELSTAN' })
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  name: string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  country: String;

  @ApiProperty({ example: 1990 })
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @IsNotEmpty()
  sire: string;

  @IsOptional()
  dam: String;

  @IsNotEmpty()
  @IsNumber()
  damcountry: String;
}
