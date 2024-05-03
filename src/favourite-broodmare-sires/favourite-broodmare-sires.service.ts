import {
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { HorsesService } from 'src/horses/horses.service';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { CreateFavouriteBroodmareSireDto } from './dto/create-favourite-broodmare-sire.dto';
import { FavouriteBroodmareSire } from './entities/favourite-broodmare-sire.entity';

@Injectable({ scope: Scope.REQUEST })
export class FavouriteBroodmareSireService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FavouriteBroodmareSire)
    private favBroodmareSireRepository: Repository<FavouriteBroodmareSire>,
    private horsesService: HorsesService,
  ) {}

  /* Add Favourite Broodmare Sire */
  async create(
    createFavouriteBroodmareSireDto: CreateFavouriteBroodmareSireDto,
  ) {
    try {
      const member = this.request.user;
      //Check stallion exist
      let horseRecord = await this.horsesService.findHorseByIdAndGender(
        createFavouriteBroodmareSireDto.horseId,
        'M',
      );
      if (!horseRecord) {
        throw new UnprocessableEntityException('Horse not exist!');
      }
      let favouriteRecord = {
        broodmareSireId: horseRecord.id,
        memberId: member['id'],
        createdBy: member['id'],
      };
      //Check Faviourate already added!
      let favRecord = await this.favBroodmareSireRepository.findOne(
        favouriteRecord,
      );
      if (favRecord) {
        throw new HttpException(
          'You have already added this to your favourite!',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      const response = await this.favBroodmareSireRepository.save(
        this.favBroodmareSireRepository.create(favouriteRecord),
      );
      return {
        statusCode: 200,
        message: 'Added Broodmare Sire to Favourite list',
        data: response,
      };
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  /* Get All Favourite Broodmare Sires */
  async findAll(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<FavouriteBroodmareSire>> {
    const member = this.request.user;
    let sortBy = 'Horsename';
    if (searchOptionsDto.sortBy) {
      sortBy = searchOptionsDto.sortBy;
      if (sortBy.toLowerCase() === 'date added') {
        sortBy = 'DateAdded';
      }
      if (sortBy.toLowerCase() === 'yob') {
        sortBy = 'Yob';
      }
      if (sortBy.toLowerCase() === 'name') {
        sortBy = 'Horsename';
      }
      if (sortBy.toLowerCase() === 'stakes winners') {
        sortBy = 'SW';
      }
      if (sortBy.toLowerCase() === 'runners') {
        sortBy = 'Runners';
      }
    }
    let entities = await this.favBroodmareSireRepository.manager.query(
      `EXEC proc_SMPGetFavouriteBroodmaresireByMember 
            @pMemberId=@0,
            @page=@1,
            @size=@2,
            @psortBy=@3`,
      [member['id'], searchOptionsDto.page, searchOptionsDto.limit, sortBy],
    );

    const records = await entities.filter((res) => res.filterType == 'record');
    const countRecord = await entities.filter(
      (res) => res.filterType == 'total',
    );
    const pageMetaDto = new PageMetaDto({
      itemCount: countRecord[0].totalRecords,
      pageOptionsDto: searchOptionsDto,
    });
    return new PageDto(records, pageMetaDto);
  }

  /* Delete Favourite Broodmare Sire */
  async remove(
    removeFavouriteBroodmareSireDto: CreateFavouriteBroodmareSireDto,
  ) {
    const record = await this.horsesService.findOne(
      removeFavouriteBroodmareSireDto.horseId,
    );
    if (!record) {
      throw new NotFoundException('Horse not exist!');
    }
    const member = this.request.user;
    const response = await this.favBroodmareSireRepository.delete({
      broodmareSireId: record.id,
      memberId: member['id'],
    });
    return response;
  }
}
