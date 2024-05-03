import {
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { StallionsService } from 'src/stallions/stallions.service';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { CreateFavouriteStallionDto } from './dto/create-favourite-stallion.dto';
import { FavouriteStallion } from './entities/favourite-stallion.entity';
import { StallionProfileImage } from 'src/stallion-profile-image/entities/stallion-profile-image.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';

@Injectable({ scope: Scope.REQUEST })
export class FavouriteStallionsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(FavouriteStallion)
    private favStallionRepository: Repository<FavouriteStallion>,
    private stallionsService: StallionsService,
    private eventEmitter: EventEmitter2,
  ) {}

  /* Add Stallion to Favourite */
  async create(createFavouriteStallionDto: CreateFavouriteStallionDto) {
    try {
      const member = this.request.user;
      //Check stallion exist
      let stallionRecord = await this.stallionsService.getStallionByUuid(
        createFavouriteStallionDto.stallionId,
      );
      let favouriteRecord = {
        stallionId: stallionRecord.id,
        memberId: member['id'],
        createdBy: member['id'],
      };
      //Check Faviourate already added!
      let favRecord = await this.favStallionRepository.findOne(favouriteRecord);
      if (favRecord) {
        throw new HttpException(
          'This horse is already listed in your My Horses list!',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      return await this.favStallionRepository.save(
        this.favStallionRepository.create(favouriteRecord),
      );
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  /* Get all Favourite Stallions */
  async findAll(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<FavouriteStallion>> {
    const member = this.request.user;
    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireCountry.countryCode as sireCountryCode, sireHorse.yob as sireYob, sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.id as sireProgenyId',
      )
      .innerJoin('sireHorse.nationality', 'sireCountry')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damCountry.countryCode as damCountryCode, damHorse.yob as damYob, damHorse.horseName as damName, damHorse.horseUuid as damId, damHorse.id as damProgenyId',
      )
      .innerJoin('damHorse.nationality', 'damCountry')
      .andWhere('damHorse.horseName IS NOT NULL');

    let spiQueryBuilder = getRepository(StallionProfileImage)
      .createQueryBuilder('spi')
      .select('spi.stallionId as mediaStallionId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'spi.media',
        'media',
        'media.id=spi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    const queryBuilder = this.favStallionRepository
      .createQueryBuilder('favouriteStallion')
      .select('stallion.stallionUuid as stallionId, mediaUrl as image')
      .addSelect('horse.horseName, horse.yob')
      .addSelect('country.countryCode as countryCode')
      .addSelect(
        'sire.sireId, sire.sireName, sire.sireYob, sire.sireCountryCode',
      )
      .addSelect('dam.damId, dam.damName, dam.damYob, dam.damCountryCode')
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN stallionpromotion.startDate AND stallionpromotion.endDate) AND (op.promotionId IS NOT NULL OR stallionpromotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .innerJoin('favouriteStallion.stallion', 'stallion')
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      )
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.damId',
      )
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin('stallionlocation.country', 'country')
      .leftJoin('stallion.stallionpromotion', 'stallionpromotion')
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=stallionpromotion.id',
      )
      .andWhere('favouriteStallion.memberId=:memberId', {
        memberId: member['id'],
      })
      .andWhere('stallion.isVerified = :isVerified', { isVerified: 1 })
      .andWhere('stallion.isActive = :isActive', { isActive: 1 });
    queryBuilder
      .orderBy('horse.horseName', searchOptionsDto.order)
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  /* Get all  Favourite Stallions With Race and Runner Details */
  async findAllWithRaceDetails(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<FavouriteStallion>> {
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
    let entities = await this.favStallionRepository.manager.query(
      `EXEC proc_SMPGetFavouriteStallionsByMember 
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

  /* Remove Stallion from Favourite */
  async remove(deleteFavouriteStallionDto: CreateFavouriteStallionDto) {
    const record = await this.stallionsService.getStallionByUuid(
      deleteFavouriteStallionDto.stallionId,
    );
    const member = this.request.user;

    const response = await this.favStallionRepository.delete({
      stallionId: record.id,
      memberId: member['id'],
    });
    this.eventEmitter.emit('removeFavStallionRecord', {
      stallionId: record.id,
      memberId: member['id'],
    });
    return {
      statusCode: 200,
      message: `This action removes a #${deleteFavouriteStallionDto.stallionId} favouriteStallion`,
      data: response,
    };
  }
}
