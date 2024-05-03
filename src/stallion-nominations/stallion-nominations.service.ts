import {
  Injectable,
  Inject,
  Scope,
  HttpException,
  HttpStatus,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CreateStallionNominationDto } from './dto/create-stallion-nomination.dto';
import { UpdateStallionNominationDto } from './dto/update-stallion-nomination.dto';
import { StallionNomination } from './entities/stallion-nomination.entity';
import { StallionsService } from 'src/stallions/stallions.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Integer } from 'aws-sdk/clients/apigateway';
import { StopStallionNominationDto } from './dto/stop-nomination.dto';

@Injectable({ scope: Scope.REQUEST })
export class StallionNominationService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(StallionNomination)
    private stallionNominationRepository: Repository<StallionNomination>,
    private stallionsService: StallionsService,
  ) {}

  /* Create a stallion nomination request */
  async create(createStallionNominationDto: CreateStallionNominationDto) {
    const member = this.request.user;
    const { stallionId } = createStallionNominationDto;
    let stallion = await this.stallionsService.findOne(stallionId);

    if (!stallion) {
      throw new HttpException('Stallion not found', HttpStatus.NOT_FOUND);
    }
    const stallionNomination = await this.findOne({ stallionId: stallion.id });
    let result;
    if (stallionNomination && stallionNomination.length > 0) {
      const updateStallionDto = {
        startDate: createStallionNominationDto.startDate,
        modifiedBy: member['id'],
        noOfNominations: createStallionNominationDto.noOfNominations,
        isActive: true,
        endDate: createStallionNominationDto.endDate,
      };
      result = this.stallionNominationRepository.update(
        { id: stallionNomination[0].id },
        updateStallionDto,
      );
    } else {
      const createDto = {
        ...createStallionNominationDto,
        stallionId: stallion.id,
        isActive: true,
        createdBy: member['id'],
      };
      result = await this.stallionNominationRepository.save(
        this.stallionNominationRepository.create(createDto),
      );
    }

    return;
  }

  /* Get all stallion nominations */
  findAll() {
    return this.stallionNominationRepository.find();
  }

  /* Get a stallion nomination */
  async findByStallionId(stallionId: Integer) {
    const queryBuilder = this.stallionNominationRepository
      .createQueryBuilder('stallionNomination')
      .andWhere('stallionNomination.stallionId = :stallionId', {
        stallionId: stallionId,
      })
      .orderBy('id', 'DESC')
      .limit(1);
    const entities = await queryBuilder.getRawOne();
    return entities;
  }

  /* Stop a stallion nomination */
  async stopNomination(
    id: string,
    stopPromotionDto: StopStallionNominationDto,
  ) {
    const { effectiveDate } = stopPromotionDto;

    let stallionRecord = await this.stallionsService.getStallionByUuid(id);
    if (!stallionRecord) {
      throw new UnprocessableEntityException('Stallion not exist!');
    }

    const member = this.request.user;
    const latestPromotionRecoed = await this.getLatestStallionNomination(
      stallionRecord.id,
    );

    let updateStallionDto = {
      endDate: new Date(effectiveDate),
      modifiedBy: member['id'],
      isActive: false,
      noOfNominations: 0,
    };
    const response:UpdateResult = await this.updateStallionNomination(
      stallionRecord.id,
      updateStallionDto,
    );
    if(response.affected>0)
     return { statusCode: 200, message: 'Stoped Nomination', data: {} }
     else
     return {
        statusCode: HttpStatus.NOT_MODIFIED,
        message: 'Not Updated',
      };
      
      
  }

  /* Get Latest stallion nomination */
  async getLatestStallionNomination(stallionId: number) {
    let queryBuilder = await this.stallionNominationRepository
      .createQueryBuilder('stallionNomination')
      .andWhere('stallionId = :stallionId', { stallionId: stallionId })
      .orderBy('id', 'DESC')
      .limit(1);
    const itemCount = await queryBuilder.getCount();
    if (!itemCount) {
      throw new NotFoundException(
        'No nomination records found to this stallion!',
      );
    }
    return await queryBuilder.getRawOne();
  }

  /* Update a stallion nomination */
  async updateStallionNomination(
    id: number,
    updateStallionNominationDto: UpdateStallionNominationDto,
  ) {
    return this.stallionNominationRepository.update(
      { stallionId: id },
      updateStallionNominationDto,
    );
  }

  /* Get a stallion nomination */
  async findOne(entity) {
    const record = await this.stallionNominationRepository.find({
      where: entity,
    });
    if (!record) {
      throw new UnprocessableEntityException('Record not exist!');
    }
    return record;
  }
}
