import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateActualDto {
  @IsNotEmpty()
  @IsNumber()
  entityId?: number;

  @IsNotEmpty()
  @IsNumber()
  entityType?: string;

  @IsNotEmpty()
  @IsNumber()
  socialShareTypeId?: number;

  @IsOptional()
  @IsNumber()
  createdBy?: number;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
