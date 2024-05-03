import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FarmMediaFileDto } from 'src/farm-media-files/dto/farm-media-file.dto';

export class CreateMediaDto {
  // If Update/Delete then we need this
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  mediaInfoId: number;

  @ApiProperty({ example: 'Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Just a Description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  isActive: boolean;
  createdBy?: number | null;

  //testimonialId is not null and if it is true then delete else update
  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;

  @ApiProperty({ type: [FarmMediaFileDto] })
  @IsOptional()
  @Type(() => FarmMediaFileDto)
  mediaInfoFiles: FarmMediaFileDto[];
}
