import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FileInfoDto {
  @ApiProperty({ example: 'image.png' })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'image/png' })
  @IsNotEmpty()
  @IsString()
  fileType: string;

  @ApiProperty({ example: 'dir/image.png' })
  @IsNotEmpty()
  @IsString()
  filePath: string;
}
