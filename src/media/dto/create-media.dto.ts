import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMediaDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  fileName: string;

  @ApiProperty()
  @IsUUID()
  mediauuid: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mediaLocation: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mediaUrl: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mediaThumbnailUrl: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mediaShortenUrl: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  mediaFileType: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  mediaFileSize: number;

  markForDeletion?: boolean | null;
  createdBy?: number | null;
  createdOn?: Date | null;
}
