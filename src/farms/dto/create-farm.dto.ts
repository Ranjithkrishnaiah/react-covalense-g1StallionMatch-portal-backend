import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Validate,
} from 'class-validator';

export class CreateFarmDto {
  @ApiProperty({ example: "JohnSmith's Farm" })
  @IsNotEmpty()
  @Matches(RegExp("^[A-Za-z0-9 $-_.+!*'()&]+$"),{message: "Invalid special characters are not allowed and following are only allowed $-_.+!*'()&"})
  @Transform(({ value }) => value.toLowerCase().trim())
  farmName: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: 99 })
  @IsOptional()
  stateId: number;

  @ApiProperty({ example: 'farm@johnsmith-farm.com' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'www.johnsmith-farm.com' })
  @IsOptional()
  website?: string;

  @ApiProperty({ example: 'This is johnsmith farm' })
  @IsOptional()
  @IsString()
  overview: string;

  isActive?: boolean;
  createdBy?: number | null;
}
