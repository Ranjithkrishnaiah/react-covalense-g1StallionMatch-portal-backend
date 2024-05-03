import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  MinLength,
  Validate,
  IsUrl,
  IsOptional,
  MaxLength,
  IsString,
  Matches,
} from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { Transform } from 'class-transformer';

export class AuthRegisterFarmownerDto {
  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: 'john.smith@yopmail.com' })
  @Transform(({ value }) => value.toLowerCase().trim())
  @Validate(IsNotExist, ['Member'], {
    message:
      'The email address is already in use. Please try another email address',
  })
  @IsEmail()
  email: string;

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

  @ApiProperty({ example: "John Smith's Farm" })
  @IsNotEmpty()
  @IsString()
  @Matches(RegExp("^[A-Za-z0-9 $-_.+!*'()&]+$"),{message: "Invalid special characters are not allowed and following are only allowed $-_.+!*'()&"})
  farmName: string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  farmCountryId: number;

  @ApiProperty({ example: 99 })
  @IsOptional()
  farmStateId: number;

  @ApiProperty({ example: 'www.johnsmith-farm.com' })
  @IsOptional()
  farmWebsiteUrl: string;

  @ApiProperty({ example: '3685' })
  @IsNotEmpty()
  @IsOptional()
  postcode: string;
}
