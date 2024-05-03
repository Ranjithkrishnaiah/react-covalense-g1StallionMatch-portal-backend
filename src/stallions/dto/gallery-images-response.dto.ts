import { ApiResponseProperty } from '@nestjs/swagger';

export class GalleryImagesResponse {
  @ApiResponseProperty()
  mediauuid: string;

  @ApiResponseProperty()
  fileName: string;

  @ApiResponseProperty()
  mediaUrl: string;

  @ApiResponseProperty()
  mediaThumbnailUrl: string;

  @ApiResponseProperty()
  mediaShortenUrl: string;
}
