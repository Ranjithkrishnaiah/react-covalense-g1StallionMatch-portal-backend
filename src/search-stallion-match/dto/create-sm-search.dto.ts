import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSmSearchDto {
  @IsNotEmpty()
  @IsNumber()
  stallionId?: number;

  @IsNotEmpty()
  @IsNumber()
  mareId?: number;

  @IsOptional()
  @IsBoolean()
  isTwentytwentyMatch?: boolean;

  @IsOptional()
  @IsBoolean()
  isPerfectMatch?: boolean;

  @IsOptional()
  @IsNumber()
  createdBy?: number;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  countryName?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
