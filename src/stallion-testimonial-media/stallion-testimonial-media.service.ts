import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { StallionTestimonialMedia } from './entities/stallion-testimonial-media.entity';

@Injectable({ scope: Scope.REQUEST })
export class StallionTestimonialMediaService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(StallionTestimonialMedia)
    private stallionTestimonialMediaRepository: Repository<StallionTestimonialMedia>,
  ) {}

  /* Create A Media Record For a Stallion testimonial */
  async create(testimonialId: number, mediaId: number) {
    return this.stallionTestimonialMediaRepository.save(
      this.stallionTestimonialMediaRepository.create({
        testimonialId: testimonialId,
        mediaId: mediaId,
      }),
    );
  }
}
