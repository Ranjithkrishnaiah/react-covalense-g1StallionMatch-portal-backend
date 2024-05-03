import { Module } from '@nestjs/common';
import { HomeTestimonialsService } from './home-testimonial.service';
import { HomeTestimonialController } from './home-testimonial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeTestimonial } from './entities/home-testimonial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HomeTestimonial])],
  controllers: [HomeTestimonialController],
  providers: [HomeTestimonialsService],
})
export class HomeTestimonialModule {}
