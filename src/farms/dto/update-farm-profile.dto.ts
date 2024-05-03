import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  IsUUID,
  Matches,
} from 'class-validator';

export class UpdateFarmProfileDto {
  @ApiProperty({ example: "User's Farm" })
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

  @ApiProperty({ example: 'farm@user-farm.com' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'www.user-farm.com' })
  @IsUrl()
  website: string;

  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsOptional()
  @IsUUID()
  profileImageuuid: string; //If Profile image not uploaded this will be empty

  modifiedBy?: number | null;
}
