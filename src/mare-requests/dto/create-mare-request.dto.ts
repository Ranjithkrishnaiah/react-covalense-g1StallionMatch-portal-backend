import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMareRequestDto {
  @ApiProperty({ example: 'I Am Incredible' })
  @IsNotEmpty()
  @IsString()
  horseName: string;

  @ApiProperty({ example: 2015 })
  @IsNotEmpty()
  @IsNumber()
  yob: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: 'Australia' })
  @IsOptional()
  @IsString()
  countryName?: string;
  
  isApproved: false;
  createdBy?: number | null;
}
