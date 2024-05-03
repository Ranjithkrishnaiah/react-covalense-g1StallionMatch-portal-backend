import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionTestimonialMedia } from './entities/stallion-testimonial-media.entity';
import { StallionTestimonialMediaService } from './stallion-testimonial-media.service';

@Module({
  imports: [TypeOrmModule.forFeature([StallionTestimonialMedia])],
  providers: [StallionTestimonialMediaService],
  exports: [StallionTestimonialMediaService],
})
export class StallionTestimonialMediaModule {}
