import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { StallionTestimonialMediaResponse } from './stallion-testimonial-media-response.dto';

export class StallionTestimonialResponse {
  @ApiResponseProperty()
  testimonialId: number;

  @ApiResponseProperty()
  title: string;

  @ApiResponseProperty()
  company: string;

  @ApiResponseProperty()
  description: string;

  @ApiResponseProperty()
  createdOn: Date;

  @ApiResponseProperty()
  isDeleted: boolean;

  @ApiProperty({
    description: 'List of testimonial media',
    type: [StallionTestimonialMediaResponse],
  })
  @ApiResponseProperty()
  media: StallionTestimonialMediaResponse[];
}
