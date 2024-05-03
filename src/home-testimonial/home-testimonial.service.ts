import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeTestimonialResponseDto } from './dto/home-testimonial-response.dto';
import { HomeTestimonial } from './entities/home-testimonial.entity';

@Injectable()
export class HomeTestimonialsService {
  constructor(
    @InjectRepository(HomeTestimonial)
    private homeTestimonialRepository: Repository<HomeTestimonial>,
  ) {}
  /* Get All Home testimonials */
  async findAll(pageType: string): Promise<HomeTestimonialResponseDto[]> {
    const queryBuilder = this.homeTestimonialRepository
      .createQueryBuilder('hometestimonial')
      .select(
        'hometestimonial.id,hometestimonial.imagepath, hometestimonial.fullname,hometestimonial.company, hometestimonial.isActive, hometestimonial.note, hometestimonial.createdBy, hometestimonial.createdOn, hometestimonial.modifiedBy, hometestimonial.modifiedOn',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .innerJoin('hometestimonial.country', 'country')
      .innerJoin('hometestimonial.state', 'state');
    queryBuilder.andWhere('hometestimonial.pageType = :pageType', {
      pageType: pageType,
    });
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /* Get One Home testimonial by id */
  async findOne(id: number): Promise<HomeTestimonialResponseDto> {
    const queryBuilder = this.homeTestimonialRepository
      .createQueryBuilder('hometestimonial')
      .select(
        'hometestimonial.imagepath, hometestimonial.fullname, hometestimonial.isActive, hometestimonial.note, hometestimonial.createdBy, hometestimonial.createdOn, hometestimonial.modifiedBy, hometestimonial.modifiedOn',
      )
      .addSelect('country.countryName as countryName')
      .addSelect('state.stateName as stateName')
      .innerJoin('hometestimonial.country', 'country')
      .innerJoin('hometestimonial.state', 'state');
    queryBuilder.andWhere('hometestimonial.id = :id', { id: id });
    const entities = await queryBuilder.getRawOne();
    return entities;
  }
}
