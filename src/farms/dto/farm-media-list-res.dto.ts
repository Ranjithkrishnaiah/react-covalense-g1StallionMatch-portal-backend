import { ApiResponseProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class FarmMediaListResDto {
  @ApiResponseProperty()
  farmId: string;

  @ApiResponseProperty()
  mediaInfoId: number;

  @ApiResponseProperty()
  title: string;

  @ApiResponseProperty()
  description: string;

  @ApiResponseProperty()
  createdOn: Date;

  @ApiResponseProperty()
  isDeleted: boolean;

  @ApiResponseProperty()
  @IsArray()
  mediaInfoFiles: Array<{
    mediaInfoId: number;
    mediauuid: string;
    fileName: string;
    mediaUrl: string;
    mediaThumbnailUrl: string;
    mediaShortenUrl: string;
    mediaFileType: string;
  }>;
}
