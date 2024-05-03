import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { StallionTestimonial } from './entities/stallion-testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable({ scope: Scope.REQUEST })
export class StallionTestimonialsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(StallionTestimonial)
    private stallionTestimonialRepository: Repository<StallionTestimonial>,
  ) {}

  /* Create a Stallion Testimonial */
  async create(stallionId: number, testimonial: CreateTestimonialDto) {
    const member = this.request.user;
    testimonial.createdBy = member['id'];
    let data = {
      ...testimonial,
      stallionId: stallionId,
      isActive: true,
    };
    const response = await this.stallionTestimonialRepository.save(
      this.stallionTestimonialRepository.create(data),
    );
    return response;
  }

  /* Update a Stallion Testimonial */
  async update(
    stallionId: number,
    testimonialId: number,
    testimonial: UpdateTestimonialDto,
  ) {
    let record = await this.stallionTestimonialRepository.findOne({
      stallionId,
      id: testimonialId,
    });
    if (!record) {
      throw new NotFoundException('Stallion Testimonial not found!');
    }
    const member = this.request.user;
    testimonial.modifiedBy = member['id'];
    let result = await this.stallionTestimonialRepository.update(
      {
        id: testimonialId,
        stallionId: stallionId,
      },
      testimonial,
    );
    return result;
  }

  /* Get All Testimonials of a Stallion */
  async getAllTestimonialsByStallionId(stallionId: number) {
    const queryBuilder = this.stallionTestimonialRepository
      .createQueryBuilder('testimonial')
      .select(
        'testimonial.id as testimonialId, testimonial.title as title, testimonial.company as company, testimonial.description as description, testimonial.createdOn as createdOn',
      )
      .addSelect(
        'media.mediauuid, media.fileName, media.mediaUrl, media.mediaThumbnailUrl, media.mediaShortenUrl, media.mediaFileType',
      )
      .leftJoin('testimonial.stalliontestimonialmedia', 'tm')
      .leftJoin(
        'tm.media',
        'media',
        'media.id=tm.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('testimonial.stallionId = :stallionId', {
        stallionId: stallionId,
      })
      .andWhere('testimonial.isActive = :isActive', { isActive: true });
    let dbList = await queryBuilder.getRawMany();

    let testimonialsList = [];
    dbList.forEach(function (record) {
      if (!testimonialsList[record.testimonialId]) {
        testimonialsList[record.testimonialId] = {
          testimonialId: record.testimonialId,
          title: record.title,
          company: record.company,
          description: record.description,
          createdOn: record.createdOn,
          isDeleted: false,
          media: [],
        };
      }
      if (record.mediauuid && record.mediaUrl) {
        let mediaItem = {
          testimonialId: record.testimonialId,
          mediauuid: record.mediauuid,
          fileName: record.fileName,
          mediaUrl: record.mediaUrl,
          mediaThumbnailUrl: record.mediaThumbnailUrl,
          mediaShortenUrl: record.mediaShortenUrl,
          mediaFileType: record.mediaFileType,
          mediaFileSize: record.mediaFileSize,
        };
        testimonialsList[record.testimonialId].media.push(mediaItem);
      }
    });
    let finalList = testimonialsList.filter(function (item) {
      return item != null;
    });
    return finalList;
  }

  /* Delete a Stallion Testimonial */
  async delete(stallionId: number, testimonialId: number) {
    let response = await this.stallionTestimonialRepository.findOne({
      id: testimonialId,
      stallionId: stallionId,
      isActive: true,
    });
    if (!response) {
      throw new NotFoundException('Stallion Testimonial not found!');
    }
    const member = this.request.user;
    const record = await this.stallionTestimonialRepository.findOne({
      id: testimonialId,
      stallionId: stallionId,
    });
    record.isActive = false;
    record.deletedBy = member['id'];
    record.save();
    return record;
  }

  /* Get Testimonial Count By Stallion */
  async getTestimonialCount(stallionId: number) {
    return await this.stallionTestimonialRepository.count({
      stallionId: stallionId,
      isActive: true,
    });
  }
}
