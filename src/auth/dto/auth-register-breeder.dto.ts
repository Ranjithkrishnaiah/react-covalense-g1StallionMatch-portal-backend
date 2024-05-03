import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  MinLength,
  Validate,
  MaxLength,
  IsString,
  IsOptional,
} from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';
import { Transform } from 'class-transformer';

export class AuthRegisterBreederDto {
  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: '3685' })
  @IsNotEmpty()
  @IsOptional()
  postcode: string;

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
}
