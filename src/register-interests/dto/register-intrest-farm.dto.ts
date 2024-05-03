import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  Matches,
} from 'class-validator';

export class RegisterIntrestFarmDto {
  @ApiProperty({ minimum: 3, maximum: 50 })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ minimum: 4, maximum: 50 })
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  @Matches(RegExp("^[A-Za-z0-9 $-_.+!*'()&]+$"),{message: "Invalid special characters are not allowed and following are only allowed $-_.+!*'()&"})
  farmName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  countryId: number;
}
