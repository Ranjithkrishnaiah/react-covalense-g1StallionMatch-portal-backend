import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StallionTestimonialMediaModule } from 'src/stallion-testimonial-media/stallion-testimonial-media.module';
import { StallionTestimonial } from './entities/stallion-testimonial.entity';
import { StallionTestimonialsController } from './stallion-testimonials.controller';
import { StallionTestimonialsService } from './stallion-testimonials.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StallionTestimonial]),
    StallionTestimonialMediaModule,
  ],
  controllers: [StallionTestimonialsController],
  providers: [StallionTestimonialsService],
  exports: [StallionTestimonialsService],
})
export class StallionTestimonialsModule {}
