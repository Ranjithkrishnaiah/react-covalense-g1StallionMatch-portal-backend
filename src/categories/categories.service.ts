import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  /* Get All Categories */
  findAll() {
    return this.categoryRepository.find();
  }

  /* Get Category By Id */
  findOne(id: number) {
    return this.categoryRepository.find({
      id,
    });
  }
}
