import {
  Injectable,
  Inject,
  UnprocessableEntityException,
  Scope,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FarmsService } from 'src/farms/farms.service';
import { Member } from 'src/members/entities/member.entity';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { getRepository, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateFavouriteFarmDto } from './dto/create-favourite-farm.dto';
import { FavouriteFarm } from './entities/favourite-farm.entity';
import { FarmProfileImage } from 'src/farm-profile-image/entities/farm-profile-image.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable({ scope: Scope.REQUEST })
export class FavouriteFarmsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FavouriteFarm)
    private favouriteFarmRepository: Repository<FavouriteFarm>,
    private farmService: FarmsService,
    private eventEmitter: EventEmitter2,
  ) {}

  /* Add Favourite Farm */
  async create(createFavouriteFarmDto: CreateFavouriteFarmDto) {
    try {
      //Check farm exist
      let farmRecord = await this.farmService.findOne({
        farmUuid: createFavouriteFarmDto.farmId,
      });
      if (!farmRecord) {
        throw new UnprocessableEntityException('Farm not exist!');
      }
      const member = this.request.user;
      let favouriteRecord = {
        farmId: farmRecord.id,
        memberId: member['id'],
        createdBy: member['id'],
      };
      //Check Faviourate already added!
      let favRecord = await this.favouriteFarmRepository.findOne(
        favouriteRecord,
      );
      if (favRecord) {
        throw new HttpException(
          'You have already added this to your favourite!',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      return await this.favouriteFarmRepository.save(
        this.favouriteFarmRepository.create(favouriteRecord),
      );
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  /* Get All Favourite Farms */
  async findAll(
    member: Member,
    pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<FavouriteFarm>> {
    let fpiQueryBuilder = getRepository(FarmProfileImage)
      .createQueryBuilder('fpi')
      .select('fpi.farmId as mediaFarmId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'fpi.media',
        'media',
        'media.id=fpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");
    const queryBuilder = this.favouriteFarmRepository
      .createQueryBuilder('favouriteFarm')
      .select('favouriteFarm.id as id')
      .addSelect(
        'farm.farmUuid as farmId, farm.farmName as farmName, mediaUrl as image',
      )
      .innerJoin(
        'favouriteFarm.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .leftJoin(
        '(' + fpiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=farm.id',
      )
      .andWhere('favouriteFarm.memberId=:memberId', { memberId: member['id'] });
    queryBuilder
      .orderBy('farm.farmName', pageOptionsDto.order)
      .offset(pageOptionsDto.skip)
      .limit(pageOptionsDto.limit);
    if (pageOptionsDto.sortBy) {
      const sortBy = pageOptionsDto.sortBy;
      queryBuilder.orderBy('farm.farmName', 'ASC');
      if (sortBy.toLowerCase() === 'recently updated') {
        queryBuilder.orderBy('farm.modifiedOn', 'DESC');
      }
      if (sortBy.toLowerCase() === 'date added') {
        queryBuilder.orderBy('favouriteFarm.createdOn', 'DESC');
      }
    }
    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOptionsDto,
    });
    return new PageDto(entities, pageMetaDto);
  }

  /* Delete Favourite Farm */
  async remove(removeFavouriteFarmDto: CreateFavouriteFarmDto) {
    const record = await this.farmService.findOne({
      farmUuid: removeFavouriteFarmDto.farmId,
    });
    if (!record) {
      throw new UnprocessableEntityException('Farm not exist!');
    }
    const member = this.request.user;
    this.eventEmitter.emit('removeFavFarmRecord', record);
    const response = await this.favouriteFarmRepository.delete({
      farmId: record.id,
      memberId: member['id'],
    });
    return {
      statusCode: 200,
      message: `This action removes a #${removeFavouriteFarmDto.farmId} favouriteFarm`,
      data: response,
    };
  }
}
