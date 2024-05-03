import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePageViewDto {
  @IsNotEmpty()
  @IsNumber()
  entityId?: number;

  @IsNotEmpty()
  @IsNumber()
  entityType?: string;

  @IsNotEmpty()
  @IsNumber()
  referrer?: string;

  @IsOptional()
  @IsNumber()
  createdBy?: number;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  countryName?: string;
}
