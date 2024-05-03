import { ApiResponseProperty } from '@nestjs/swagger';

export class StallionTestimonialMediaResponse {
  @ApiResponseProperty()
  testimonialId: number;

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

  @ApiResponseProperty()
  mediaFileType: string;
}
