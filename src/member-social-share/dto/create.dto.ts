import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SocialShareTypeEnum } from 'src/social-share-types/social-share-type.enum';

export class CreateDto {
  @IsNotEmpty()
  @IsNumber()
  entityId?: number;

  @IsNotEmpty()
  @IsNumber()
  entityType?: string;

  @ApiProperty({ enum: SocialShareTypeEnum })
  @IsNotEmpty()
  socialShareTypeId: SocialShareTypeEnum;

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
