import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ContactusDto {
  @ApiProperty({ example: ['Promote My Stallion', 'Other'] })
  @IsString({ each: true })
  @ArrayMinSize(1)
  interestedIn: string[];

  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  @IsString()
  contactName: string;

  @ApiProperty({ example: 'john.smith@yopmail.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @IsEmail()
  contactEmail: string;

  @ApiProperty({ example: 'Sample Details' })
  @IsNotEmpty()
  @IsString()
  contactDescription: string;

  @ApiProperty({ example: 'Australia' })
  @IsOptional()
  countryName: string;
}
