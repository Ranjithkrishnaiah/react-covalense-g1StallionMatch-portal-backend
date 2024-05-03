import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { CreateTestimonialDto } from 'src/stallion-testimonials/dto/create-testimonial.dto';

export class UpdateStallionTestimonialDto {
  @ApiProperty({ type: [CreateTestimonialDto] })
  @IsOptional()
  @Type(() => CreateTestimonialDto)
  testimonials: CreateTestimonialDto[];
}
