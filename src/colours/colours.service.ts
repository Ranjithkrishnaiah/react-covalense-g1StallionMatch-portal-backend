import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { ColorResponse } from './dto/color-response.dto';
import { Colour } from './entities/colour.entity';

@Injectable()
export class ColoursService {
  constructor(
    @InjectRepository(Colour)
    private colourRepository: Repository<Colour>,
  ) {}

  /* Get All Colors */
  async findAll(): Promise<ColorResponse[]> {
    const queryBuilder = this.colourRepository
      .createQueryBuilder('colour')
      .select('colour.id, colour.colourName, colour.colourCode');
    queryBuilder.orderBy('colour.colourName', 'ASC');

    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /* Get All Dominancy Colors */
  async findAllDominancyColours(): Promise<ColorResponse[]> {
    let colourDominancyQb = getRepository(Colour)
        .createQueryBuilder('colour')
        .select('DISTINCT colour.colourDominancy')
        //.andWhere(`colour.colourDominancy != '-'`);
    const queryBuilder = this.colourRepository
      .createQueryBuilder('colour')
      .select('colour.id, colour.colourName, colour.colourCode')
      .andWhere('colour.colourName IN(' + colourDominancyQb.getQuery() + ')')
    queryBuilder.orderBy('colour.colourName', 'ASC');

    const entities = await queryBuilder.getRawMany();
    return entities;
  }
}
