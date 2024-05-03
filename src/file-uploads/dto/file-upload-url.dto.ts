import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FileUploadUrlDto {
  @ApiProperty({ example: 'image.png' })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsNotEmpty()
  @IsString()
  fileuuid: string;

  @ApiProperty({ example: 1024 })
  @IsNotEmpty()
  @IsNumber()
  fileSize: number;
}
