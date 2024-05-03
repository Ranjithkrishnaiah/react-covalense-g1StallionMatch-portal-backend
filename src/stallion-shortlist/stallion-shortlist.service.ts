import {
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesService } from 'src/horses/horses.service';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { StallionGalleryImage } from 'src/stallion-gallery-images/entities/stallion-gallery-image.entity';
import { StallionProfileImage } from 'src/stallion-profile-image/entities/stallion-profile-image.entity';
import { StallionServiceFee } from 'src/stallion-service-fees/entities/stallion-service-fee.entity';
import { PriceMinMaxOptionsDto } from 'src/stallions/dto/price-min-max-options.dto';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { StallionsService } from 'src/stallions/stallions.service';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Repository, getRepository } from 'typeorm';
import { CreateStallionShortlistDto } from './dto/create-stallion-shortlist.dto';
import { GuestPriceMinMaxOptionsDtoRes } from './dto/guest-price-min-max-optio-res.dto';
import { GuestPriceMinMaxOptionsDto } from './dto/guest-price-min-max-options.dto';
import { GuestSearchOptionsDto } from './dto/guest-search-options.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { StallionShortlist } from './entities/stallion-shortlist.entity';

@Injectable({ scope: Scope.REQUEST })
export class StallionShortlistService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(StallionShortlist)
    private stallionShortlistRepository: Repository<StallionShortlist>,
    private stallionsService: StallionsService,
    private currenciesService: CurrenciesService,
    private horsesService: HorsesService,
    private readonly configService: ConfigService,
  ) {}

  /* Get Shortlist stallions Min max fee Range - Authorized */
  async getMemberStallionShortlistsMinMaxFee(
    searchOptionsDto: PriceMinMaxOptionsDto,
  ): Promise<GuestPriceMinMaxOptionsDtoRes> {
    const member = this.request.user;
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    let fromCurrencyRate: number | null;
    let toCurrencyRate: number | null;
    let minInputPrice: number | null;
    let maxInputPrice: number | null;
    if (searchOptionsDto?.fromCurrency) {
      let fromCurrencyData =
        await this.currenciesService.findCurrencyRateByCurrencyId(
          searchOptionsDto?.fromCurrency,
        );
      if (fromCurrencyData) {
        fromCurrencyRate = fromCurrencyData.rate;
      }
    }
    if (searchOptionsDto?.toCurrency) {
      let toCurrencyData =
        await this.currenciesService.findCurrencyRateByCurrencyId(
          searchOptionsDto?.toCurrency,
        );
      if (toCurrencyData) {
        toCurrencyRate = toCurrencyData.rate;
        destinationCurrencyCode = toCurrencyData.currencyCode;
      }
    }

    let studFeeSubQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'studFee.stallionId as stallionId, MAX(studFee.feeYear) as studFeeYear',
      )
      .groupBy('studFee.stallionId');

    let studFeeQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('t1')
      .select('MAX(t1.id) studFeeId, t1.stallionId feeStallionId')
      .innerJoin(
        '(' + studFeeSubQueryBuilder.getQuery() + ')',
        't2',
        't2.stallionId=t1.stallionId and t1.feeYear=t2.studFeeYear',
      )
      .groupBy('t1.stallionId');

    const queryBuilder = this.stallionShortlistRepository
      .createQueryBuilder('stallionshortlist')
      .select(
        'MIN(CEILING(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate))) minPrice, MAX(CEILING(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate))) maxPrice',
      )
      .innerJoin('stallionshortlist.stallion', 'stallion')
      .innerJoin(
        'stallion.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .innerJoin('horse.colour', 'colour')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .innerJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .innerJoin('stallionservicefee.currency', 'currency')
      .innerJoin(
        'tblCurrencyRate',
        'actCurrency',
        'actCurrency.currencyCode=currency.currencyCode',
      )
      .innerJoin(
        'tblCurrencyRate',
        'destCurrency',
        "destCurrency.currencyCode='" + destinationCurrencyCode + "'",
      )
      .innerJoin('stallionlocation.country', 'country')
      .andWhere('stallionshortlist.memberId = :memberId', {
        memberId: member['id'],
      });

    let data = await queryBuilder.getRawOne();
    if (!data) {
      return {
        minPrice: 0,
        maxPrice: 0,
        minInputPrice: null,
        maxInputPrice: null,
        scaleRange: 0,
      };
    }

    if (searchOptionsDto?.priceRange) {
      const priceRange = searchOptionsDto.priceRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2 && fromCurrencyRate && toCurrencyRate) {
        minInputPrice = Math.round(
          parseInt(priceList[0]) * (toCurrencyRate / fromCurrencyRate),
        );
        maxInputPrice = Math.round(
          parseInt(priceList[1]) * (toCurrencyRate / fromCurrencyRate),
        );
      }
    }
    let scaleRange = Math.round(data.maxPrice / 100);
    return {
      scaleRange: scaleRange,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      minInputPrice: minInputPrice,
      maxInputPrice: maxInputPrice,
    };
  }

  /* Get Shortlist stallions Min max fee Range - UnAuthorized */
  async getGuestStallionShortlistsMinMaxFee(
    searchOptionsDto: GuestPriceMinMaxOptionsDto,
  ): Promise<GuestPriceMinMaxOptionsDtoRes> {
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    let fromCurrencyRate: number | null;
    let toCurrencyRate: number | null;
    let minInputPrice: number | null;
    let maxInputPrice: number | null;
    if (searchOptionsDto?.fromCurrency) {
      let fromCurrencyData =
        await this.currenciesService.findCurrencyRateByCurrencyId(
          searchOptionsDto?.fromCurrency,
        );
      if (fromCurrencyData) {
        fromCurrencyRate = fromCurrencyData.rate;
      }
    }
    if (searchOptionsDto?.toCurrency) {
      let toCurrencyData =
        await this.currenciesService.findCurrencyRateByCurrencyId(
          searchOptionsDto?.toCurrency,
        );
      if (toCurrencyData) {
        toCurrencyRate = toCurrencyData.rate;
        destinationCurrencyCode = toCurrencyData.currencyCode;
      }
    }

    let studFeeSubQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'studFee.stallionId as stallionId, MAX(studFee.feeYear) as studFeeYear',
      )
      .groupBy('studFee.stallionId');

    let studFeeQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('t1')
      .select('MAX(t1.id) studFeeId, t1.stallionId feeStallionId')
      .innerJoin(
        '(' + studFeeSubQueryBuilder.getQuery() + ')',
        't2',
        't2.stallionId=t1.stallionId and t1.feeYear=t2.studFeeYear',
      )
      .groupBy('t1.stallionId');

    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select(
        'MIN(CEILING(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate))) minPrice, MAX(CEILING(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate))) maxPrice',
      )
      .innerJoin(
        'stallion.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .innerJoin('horse.colour', 'colour')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .innerJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .innerJoin('stallionservicefee.currency', 'currency')
      .innerJoin(
        'tblCurrencyRate',
        'actCurrency',
        'actCurrency.currencyCode=currency.currencyCode',
      )
      .innerJoin(
        'tblCurrencyRate',
        'destCurrency',
        "destCurrency.currencyCode='" + destinationCurrencyCode + "'",
      )
      .innerJoin('stallionlocation.country', 'country');
    if (searchOptionsDto.stallionIds) {
      let stallionIds = searchOptionsDto.stallionIds.split('|');
      queryBuilder.andWhere('stallion.stallionUuid IN (:...stallionIds)', {
        stallionIds: stallionIds,
      });
    }

    let data = await queryBuilder.getRawOne();
    if (!data) {
      return {
        minPrice: 0,
        maxPrice: 0,
        minInputPrice: null,
        maxInputPrice: null,
        scaleRange: 0,
      };
    }

    if (searchOptionsDto?.priceRange) {
      const priceRange = searchOptionsDto.priceRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2 && fromCurrencyRate && toCurrencyRate) {
        minInputPrice = Math.round(
          parseInt(priceList[0]) * (toCurrencyRate / fromCurrencyRate),
        );
        maxInputPrice = Math.round(
          parseInt(priceList[1]) * (toCurrencyRate / fromCurrencyRate),
        );
      }
    }
    let scaleRange = Math.round(data.maxPrice / 100);

    return {
      scaleRange: scaleRange,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      minInputPrice: minInputPrice,
      maxInputPrice: maxInputPrice,
    };
  }

  /* Create A Record For Shortlist a stallion */
  async create(createStallionShortlistDto: CreateStallionShortlistDto) {
    let stallionRecord = await this.stallionsService.findOne(
      createStallionShortlistDto.stallionId,
    );
    if (!stallionRecord) {
      throw new UnprocessableEntityException('Stallion not exist!');
    }
    const member = this.request.user;
    let stallionShortlisted = await this.findOne(
      member['id'],
      stallionRecord.id,
    );
    if (stallionShortlisted) {
      stallionShortlisted.save();
      return stallionShortlisted;
    }

    let data = {
      stallionId: stallionRecord.id,
      memberId: member['id'],
    };
    return this.stallionShortlistRepository.save(
      this.stallionShortlistRepository.create(data),
    );
  }

  /* Get all Shortlisted stallions for a member */
  async findAll(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<StallionShortlist>> {
    const member = this.request.user;
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    if (searchOptionsDto?.currency) {
      let currencyData = await this.currenciesService.findOne(
        searchOptionsDto?.currency,
      );
      if (currencyData) {
        destinationCurrencyCode = currencyData.currencyCode;
      }
    }

    let studFeeSubQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'studFee.stallionId as stallionId, MAX(studFee.feeYear) as studFeeYear',
      )
      .groupBy('studFee.stallionId');

    let studFeeQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('t1')
      .select('MAX(t1.id) studFeeId, t1.stallionId feeStallionId')
      .innerJoin(
        '(' + studFeeSubQueryBuilder.getQuery() + ')',
        't2',
        't2.stallionId=t1.stallionId and t1.feeYear=t2.studFeeYear',
      )
      .groupBy('t1.stallionId');

    let spiQueryBuilder = getRepository(StallionProfileImage)
      .createQueryBuilder('spi')
      .select(
        'spi.stallionId as mediaStallionId, media.mediaUrl as profileMediaUrl',
      )
      .innerJoin(
        'spi.media',
        'media',
        'media.id=spi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    let sgiQueryBuilder = getRepository(StallionGalleryImage)
      .createQueryBuilder('sgi')
      .select(
        'MAX(sgi.mediaId) as sgiMediaId, sgi.stallionId as galleryStallionId',
      )
      .innerJoin('sgi.media', 'media', 'media.id=sgi.mediaId')
      .andWhere('sgi.imagePosition = 0')
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .groupBy('sgi.stallionId');

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    const queryBuilder = this.stallionShortlistRepository
      .createQueryBuilder('stallionshortlist')
      .select(
        'stallion.stallionUuid as stallionId, profileMediaUrl as profilePic, sgiMedia.mediaUrl as galleryImage, stallion.url, stallion.yearToStud, stallion.yearToRetired, stallion.overview',
      )
      .addSelect('horse.horseName, horse.yob')
      .addSelect('colour.colourName as colourName')
      .addSelect('farm.farmName as farmName')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect('stallionservicefee.fee as fee')
      .addSelect('stallionservicefee.feeYear as feeYear')
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .innerJoin('stallionshortlist.stallion', 'stallion')
      .innerJoin(
        'stallion.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .innerJoin('horse.colour', 'colour')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .innerJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .innerJoin('stallionservicefee.currency', 'currency')
      .innerJoin(
        'tblCurrencyRate',
        'actCurrency',
        'actCurrency.currencyCode=currency.currencyCode',
      )
      .innerJoin(
        'tblCurrencyRate',
        'destCurrency',
        "destCurrency.currencyCode='" + destinationCurrencyCode + "'",
      )
      .innerJoin('stallionlocation.country', 'country')
      .leftJoin('stallionlocation.state', 'state')
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .leftJoin('stallion.stallionnomination', 'nomination')
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      )
      .leftJoin(
        '(' + sgiQueryBuilder.getQuery() + ')',
        'sgi',
        'galleryStallionId=stallion.id',
      )
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=promotion.id',
      )
      .leftJoin('tblMedia', 'sgiMedia', 'sgiMedia.id=sgi.sgiMediaId')
      .andWhere('stallionshortlist.memberId = :memberId', {
        memberId: member['id'],
      });

    if (searchOptionsDto.sireId) {
      let sireIds = searchOptionsDto.sireId.split(',');
      let sireIdQb = getRepository(Horse)
        .createQueryBuilder('horse')
        .select('horse.id')
        // .andWhere("horse.horseUuid=:horseId", {'horseId': searchOptionsDto.sireId})
        .andWhere('horse.horseUuid IN (:...sireIds)', { sireIds: sireIds })
        .andWhere('horse.sex=:sex', { sex: 'M' })
        .andWhere('horse.isVerified=:isVerified', { isVerified: 1 });

      let sireQueryBuilder = getRepository(Stallion)
        .createQueryBuilder('st')
        .select('st.id as sireStallionId')
        .innerJoin(
          'st.horse',
          'horse',
          'horse.isVerified=1 AND horse.isActive=1',
        )
        .andWhere('horse.sireId IN(' + sireIdQb.getQuery() + ')')
        .andWhere('st.isActive=:isActive', { isActive: 1 })
        .andWhere('st.isVerified=:isVerified', { isVerified: 1 })
        .setParameters(sireIdQb.getParameters());

      queryBuilder
        .innerJoin(
          '(' + sireQueryBuilder.getQuery() + ')',
          'sire',
          'sireStallionId=stallion.id',
        )
        .setParameters(sireQueryBuilder.getParameters());
    }

    if (searchOptionsDto.damSireId) {
      let damSireIds = searchOptionsDto.damSireId.split(',');
      let damSireIdQb = getRepository(Horse)
        .createQueryBuilder('horse')
        .select('horse.id')
        //.andWhere("horse.horseUuid=:horseId", {'horseId': searchOptionsDto.damSireId})
        .andWhere('horse.horseUuid IN (:...damSireIds)', {
          damSireIds: damSireIds,
        })
        .andWhere('horse.sex=:msex', { msex: 'M' })
        .andWhere('horse.isVerified=:isVerified', { isVerified: 1 });

      let damIdQb = getRepository(Horse)
        .createQueryBuilder('horse')
        .select('horse.id')
        .andWhere('horse.sireId IN(' + damSireIdQb.getQuery() + ')')
        .andWhere('horse.sex=:ssex', { ssex: 'F' })
        .andWhere('horse.isVerified=:isVerified', { isVerified: 1 })
        .setParameters(damSireIdQb.getParameters());

      let damSireQueryBuilder = getRepository(Stallion)
        .createQueryBuilder('stt')
        .select('stt.id as damSireStallionId')
        .innerJoin(
          'stt.horse',
          'horse',
          'horse.isVerified=1 AND horse.isActive=1',
        )
        .andWhere('horse.damId IN(' + damIdQb.getQuery() + ')')
        .andWhere('stt.isActive=:isActive', { isActive: 1 })
        .andWhere('stt.isVerified=:isVerified', { isVerified: 1 })
        .setParameters(damIdQb.getParameters());

      queryBuilder
        .innerJoin(
          '(' + damSireQueryBuilder.getQuery() + ')',
          'damSire',
          'damSireStallionId=stallion.id',
        )
        .setParameters(damSireQueryBuilder.getParameters());
    }

    //Addition of filtering stallions by key Ancestors
    if (searchOptionsDto.keyAncestorId) {
      let keyAncestorHorses =
        await this.horsesService.getAllAncestorHorsesByHorseId(
          searchOptionsDto.keyAncestorId,
        );
      let ancestorHorsesList = [];
      await keyAncestorHorses.map(async (item) => {
        ancestorHorsesList.push(item.horseId);
      });
      if (ancestorHorsesList.length) {
        if (searchOptionsDto.isExcludeKeyAncestor) {
          queryBuilder.andWhere(
            'stallion.horseId NOT IN(:...ancestorHorsesList)',
            { ancestorHorsesList: ancestorHorsesList },
          );
        } else {
          queryBuilder.andWhere('stallion.horseId IN(:...ancestorHorsesList)', {
            ancestorHorsesList: ancestorHorsesList,
          });
        }
      } else {
        if (!searchOptionsDto.isExcludeKeyAncestor) {
          queryBuilder.andWhere('stallion.horseId IS NULL');
        }
      }
    }

    if (searchOptionsDto.farms) {
      let farms = searchOptionsDto.farms.split('|');
      queryBuilder.andWhere('farm.farmUuid  IN (:...farms)', { farms: farms });
    }

    if (searchOptionsDto.stallionName) {
      queryBuilder.andWhere('horse.horseName like :stallionName', {
        stallionName: `%${searchOptionsDto.stallionName}%`,
      });
    }
    if (searchOptionsDto.farmName) {
      queryBuilder.andWhere('farm.farmName like :farmName', {
        farmName: `%${searchOptionsDto.farmName}%`,
      });
    }

    if (searchOptionsDto.farmId) {
      queryBuilder.andWhere('farm.farmUuid = :farmId', {
        farmId: searchOptionsDto.farmId,
      });
    }
    if (searchOptionsDto.location) {
      const locationsList = searchOptionsDto.location.split('|');
      let countryList = [];
      let stateList = [];
      locationsList.map(function (item: string) {
        if (item.includes('_')) {
          let countryStateData = item.split('_');
          if (countryStateData[1] == '0') {
            countryList.push(countryStateData[0]);
          }
          if (countryStateData[0] != '0' && countryStateData[1] != '0') {
            stateList.push(countryStateData[1]);
          }
        }
      });
      let countryListData = countryList.filter(
        (item, i, ar) => ar.indexOf(item) === i,
      );
      let stateListData = stateList.filter(
        (item, i, ar) => ar.indexOf(item) === i,
      );
      if (countryListData.length > 0 && stateListData.length > 0) {
        queryBuilder.andWhere(
          '(stallionlocation.countryId  IN (:...countryList) OR stallionlocation.stateId IN (:...stateList))',
          { countryList: countryListData, stateList: stateListData },
        );
      }

      if (countryListData.length > 0 && stateListData.length == 0) {
        queryBuilder.andWhere(
          'stallionlocation.countryId  IN (:...countryList)',
          { countryList: countryListData },
        );
      }

      if (countryListData.length == 0 && stateListData.length > 0) {
        queryBuilder.andWhere('stallionlocation.stateId  IN (:...stateList)', {
          stateList: stateListData,
        });
      }
    }
    if (searchOptionsDto.yearToStud) {
      let yearToStud = searchOptionsDto.yearToStud.split('|');
      let yearToStudList = yearToStud.map((res) => parseInt(res));
      queryBuilder.andWhere('stallion.yearToStud  IN (:...yearToStud)', {
        yearToStud: yearToStudList,
      });
    }
    if (searchOptionsDto.colour) {
      let colour = searchOptionsDto.colour.split('|');
      let colourList = colour.map((res) => parseInt(res));
      queryBuilder.andWhere('colour.colourDominancyId IN (:...colour)', {
        colour: colourList,
      });
    }
    queryBuilder.orderBy(
      'CASE WHEN getutcdate() BETWEEN promotion.startDate AND promotion.endDate THEN 1 ELSE 0 END ',
      'DESC',
    );
    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      switch (sortBy.toLowerCase()) {
        case 'promoted':
          queryBuilder.addOrderBy(
            'CASE WHEN getutcdate() BETWEEN promotion.startDate AND promotion.endDate THEN 1 ELSE 0 END ',
            'DESC',
          );
          break;
        case 'stud fee':
          queryBuilder.addOrderBy('CASE WHEN stallionservicefee.isPrivateFee=0 THEN 1 ELSE 0 END', 'DESC');
          queryBuilder.addOrderBy('(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate))', 'DESC');
          break;
        case 'recently updated':
          queryBuilder.addOrderBy('stallion.modifiedOn', 'DESC');
          break;
        case 'available nominations':
          queryBuilder.addOrderBy('nomination.noOfNominations', 'DESC');
          break;
        case 'alphabetical':
          queryBuilder.addOrderBy('horse.horseName', 'ASC');
          break;
        default:
          queryBuilder.addOrderBy(
            'CASE WHEN getutcdate() BETWEEN promotion.startDate AND promotion.endDate THEN 1 ELSE 0 END ',
            'DESC',
          );
      }
    }
    queryBuilder.addOrderBy('horse.horseName', 'ASC');

    if (searchOptionsDto.stallionName) {
      let searchName = searchOptionsDto.stallionName.replace(/[^a-zA-Z ]/g, '');
      const orderByCaseData =
        "CASE WHEN horse.horseName = '" +
        searchName +
        "' THEN 0 WHEN horse.horseName LIKE '" +
        searchName +
        "%' THEN 1 WHEN horse.horseName LIKE '%" +
        searchName +
        "%' THEN 2  WHEN horse.horseName LIKE '%" +
        searchName +
        "' THEN 3  ELSE 4 END";
      queryBuilder.orderBy(orderByCaseData, 'ASC');
    }

    if (searchOptionsDto.priceRange) {
      const priceRange = searchOptionsDto.priceRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2) {
        let minPrice = priceList[0];
        let maxPrice = priceList[1];
        if (searchOptionsDto.isPrivateFee) {
          queryBuilder.andWhere(
            '(((stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) <= :maxPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1)',
            {
              minPrice,
              maxPrice,
            },
          );
        } else {
          queryBuilder.andWhere(
            '(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) <= :maxPrice AND stallionservicefee.isPrivateFee=0',
            {
              minPrice,
              maxPrice,
            },
          );
        }
      }
    } else {
      if(!searchOptionsDto.isPrivateFee) {
        queryBuilder.andWhere('stallionservicefee.isPrivateFee = :isPrivateFee', {
          isPrivateFee: 0,
        });
      }
    }

    queryBuilder
      .andWhere('stallion.isActive=:isActive', { isActive: 1 })
      .andWhere('stallion.isVerified=:isVerified', { isVerified: 1 });
    const entitiesWithoutLimit = await queryBuilder.getRawMany();
    let min = 0,
      max = 10000000;
    if (
      searchOptionsDto.colour ||
      searchOptionsDto.currency ||
      searchOptionsDto.damSireId ||
      searchOptionsDto.farmId ||
      searchOptionsDto.farmName ||
      searchOptionsDto.farms ||
      searchOptionsDto.location ||
      searchOptionsDto.priceRange ||
      searchOptionsDto.promoted ||
      searchOptionsDto.sireId ||
      searchOptionsDto.stallionId ||
      searchOptionsDto.stallionName ||
      searchOptionsDto.yearToStud ||
      searchOptionsDto.isExcludeKeyAncestor ||
      searchOptionsDto.isPrivateFee ||
      searchOptionsDto.keyAncestorId
    ) {
      min = Math.min(...entitiesWithoutLimit.map((item) => item.fee));
      max = Math.max(...entitiesWithoutLimit.map((item) => item.fee));
    }

    queryBuilder.offset(searchOptionsDto.skip).limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    let finalResult = new PageDto(entities, pageMetaDto);
    finalResult['priceRange'] = { max: max, min: min };
    return finalResult;
  }

  /* Get all shortlisted stallions for a Guest User */
  async findAllGuest(
    searchOptionsDto: GuestSearchOptionsDto,
  ): Promise<PageDto<StallionShortlist>> {
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    if (searchOptionsDto?.currency) {
      let currencyData = await this.currenciesService.findOne(
        searchOptionsDto?.currency,
      );
      if (currencyData) {
        destinationCurrencyCode = currencyData.currencyCode;
      }
    }

    let studFeeSubQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('studFee')
      .select(
        'studFee.stallionId as stallionId, MAX(studFee.feeYear) as studFeeYear',
      )
      .groupBy('studFee.stallionId');

    let studFeeQueryBuilder = getRepository(StallionServiceFee)
      .createQueryBuilder('t1')
      .select('MAX(t1.id) studFeeId, t1.stallionId feeStallionId')
      .innerJoin(
        '(' + studFeeSubQueryBuilder.getQuery() + ')',
        't2',
        't2.stallionId=t1.stallionId and t1.feeYear=t2.studFeeYear',
      )
      .groupBy('t1.stallionId');

    let spiQueryBuilder = getRepository(StallionProfileImage)
      .createQueryBuilder('spi')
      .select(
        'spi.stallionId as mediaStallionId, media.mediaUrl as profileMediaUrl',
      )
      .innerJoin(
        'spi.media',
        'media',
        'media.id=spi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    let sgiQueryBuilder = getRepository(StallionGalleryImage)
      .createQueryBuilder('sgi')
      .select(
        'MAX(sgi.mediaId) as sgiMediaId, sgi.stallionId as galleryStallionId',
      )
      .innerJoin('sgi.media', 'media', 'media.id=sgi.mediaId')
      .andWhere('sgi.imagePosition = 0')
      .andWhere('media.markForDeletion = 0')
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''")
      .groupBy('sgi.stallionId');

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select(
        'stallion.stallionUuid as stallionId, profileMediaUrl as profilePic, sgiMedia.mediaUrl as galleryImage, stallion.url, stallion.yearToStud, stallion.yearToRetired, stallion.overview',
      )
      .addSelect('horse.horseName, horse.yob')
      .addSelect('colour.colourName as colourName')
      .addSelect('farm.farmName as farmName')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect('stallionservicefee.fee as fee')
      .addSelect('stallionservicefee.feeYear as feeYear')
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .innerJoin(
        'stallion.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .innerJoin('horse.colour', 'colour')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .innerJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .innerJoin('stallionservicefee.currency', 'currency')
      .innerJoin(
        'tblCurrencyRate',
        'actCurrency',
        'actCurrency.currencyCode=currency.currencyCode',
      )
      .innerJoin(
        'tblCurrencyRate',
        'destCurrency',
        "destCurrency.currencyCode='" + destinationCurrencyCode + "'",
      )
      .innerJoin('stallionlocation.country', 'country')
      .leftJoin('stallionlocation.state', 'state')
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .leftJoin('stallion.stallionnomination', 'nomination')
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      )
      .leftJoin(
        '(' + sgiQueryBuilder.getQuery() + ')',
        'sgi',
        'galleryStallionId=stallion.id',
      )
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=promotion.id',
      )
      .leftJoin('tblMedia', 'sgiMedia', 'sgiMedia.id=sgi.sgiMediaId');
    if (searchOptionsDto.sireId) {
      let sireIds = searchOptionsDto.sireId.split(',');
      let sireIdQb = getRepository(Horse)
        .createQueryBuilder('horse')
        .select('horse.id')
        .andWhere('horse.horseUuid IN (:...sireIds)', { sireIds: sireIds })
        .andWhere('horse.sex=:sex', { sex: 'M' })
        .andWhere('horse.isVerified=:isVerified', { isVerified: 1 });

      let sireQueryBuilder = getRepository(Stallion)
        .createQueryBuilder('st')
        .select('st.id as sireStallionId')
        .innerJoin(
          'st.horse',
          'horse',
          'horse.isVerified=1 AND horse.isActive=1',
        )
        .andWhere('horse.sireId IN(' + sireIdQb.getQuery() + ')')
        .andWhere('st.isActive=:isActive', { isActive: 1 })
        .andWhere('st.isVerified=:isVerified', { isVerified: 1 })
        .setParameters(sireIdQb.getParameters());

      queryBuilder
        .innerJoin(
          '(' + sireQueryBuilder.getQuery() + ')',
          'sire',
          'sireStallionId=stallion.id',
        )
        .setParameters(sireQueryBuilder.getParameters());
    }

    if (searchOptionsDto.damSireId) {
      let damSireIds = searchOptionsDto.damSireId.split(',');
      let damSireIdQb = getRepository(Horse)
        .createQueryBuilder('horse')
        .select('horse.id')
        .andWhere('horse.horseUuid IN (:...damSireIds)', {
          damSireIds: damSireIds,
        })
        .andWhere('horse.sex=:msex', { msex: 'M' })
        .andWhere('horse.isVerified=:isVerified', { isVerified: 1 });

      let damIdQb = getRepository(Horse)
        .createQueryBuilder('horse')
        .select('horse.id')
        .andWhere('horse.sireId IN(' + damSireIdQb.getQuery() + ')')
        .andWhere('horse.sex=:ssex', { ssex: 'F' })
        .andWhere('horse.isVerified=:isVerified', { isVerified: 1 })
        .setParameters(damSireIdQb.getParameters());

      let damSireQueryBuilder = getRepository(Stallion)
        .createQueryBuilder('stt')
        .select('stt.id as damSireStallionId')
        .innerJoin(
          'stt.horse',
          'horse',
          'horse.isVerified=1 AND horse.isActive=1',
        )
        .andWhere('horse.damId IN(' + damIdQb.getQuery() + ')')
        .andWhere('stt.isActive=:isActive', { isActive: 1 })
        .andWhere('stt.isVerified=:isVerified', { isVerified: 1 })
        .setParameters(damIdQb.getParameters());

      queryBuilder
        .innerJoin(
          '(' + damSireQueryBuilder.getQuery() + ')',
          'damSire',
          'damSireStallionId=stallion.id',
        )
        .setParameters(damSireQueryBuilder.getParameters());
    }

    //Addition of filtering stallions by key Ancestors
    if (searchOptionsDto.keyAncestorId) {
      let keyAncestorHorses =
        await this.horsesService.getAllAncestorHorsesByHorseId(
          searchOptionsDto.keyAncestorId,
        );
      let ancestorHorsesList = [];
      await keyAncestorHorses.map(async (item) => {
        ancestorHorsesList.push(item.horseId);
      });
      if (ancestorHorsesList.length) {
        if (searchOptionsDto.isExcludeKeyAncestor) {
          queryBuilder.andWhere(
            'stallion.horseId NOT IN(:...ancestorHorsesList)',
            { ancestorHorsesList: ancestorHorsesList },
          );
        } else {
          queryBuilder.andWhere('stallion.horseId IN(:...ancestorHorsesList)', {
            ancestorHorsesList: ancestorHorsesList,
          });
        }
      } else {
        if (!searchOptionsDto.isExcludeKeyAncestor) {
          queryBuilder.andWhere('stallion.horseId IS NULL');
        }
      }
    }

    if (searchOptionsDto.stallionIds) {
      let stallionIds = searchOptionsDto.stallionIds.split('|');
      queryBuilder.andWhere('stallion.stallionUuid IN (:...stallionIds)', {
        stallionIds: stallionIds,
      });
    }

    if (searchOptionsDto.farms) {
      let farms = searchOptionsDto.farms.split('|');
      queryBuilder.andWhere('farm.farmUuid  IN (:...farms)', { farms: farms });
    }

    if (searchOptionsDto.stallionName) {
      queryBuilder.andWhere('horse.horseName like :stallionName', {
        stallionName: `%${searchOptionsDto.stallionName}%`,
      });
    }
    if (searchOptionsDto.farmName) {
      queryBuilder.andWhere('farm.farmName like :farmName', {
        farmName: `%${searchOptionsDto.farmName}%`,
      });
    }
    if (searchOptionsDto.farmId) {
      queryBuilder.andWhere('farm.farmUuid = :farmId', {
        farmId: searchOptionsDto.farmId,
      });
    }
    if (searchOptionsDto.location) {
      const locationsList = searchOptionsDto.location.split('|');
      let countryList = [];
      let stateList = [];
      locationsList.map(function (item: string) {
        if (item.includes('_')) {
          let countryStateData = item.split('_');
          if (countryStateData[1] == '0') {
            countryList.push(countryStateData[0]);
          }
          if (countryStateData[0] != '0' && countryStateData[1] != '0') {
            stateList.push(countryStateData[1]);
          }
        }
      });
      let countryListData = countryList.filter(
        (item, i, ar) => ar.indexOf(item) === i,
      );
      let stateListData = stateList.filter(
        (item, i, ar) => ar.indexOf(item) === i,
      );
      if (countryListData.length > 0 && stateListData.length > 0) {
        queryBuilder.andWhere(
          '(stallionlocation.countryId  IN (:...countryList) OR stallionlocation.stateId IN (:...stateList))',
          { countryList: countryListData, stateList: stateListData },
        );
      }

      if (countryListData.length > 0 && stateListData.length == 0) {
        queryBuilder.andWhere(
          'stallionlocation.countryId  IN (:...countryList)',
          { countryList: countryListData },
        );
      }

      if (countryListData.length == 0 && stateListData.length > 0) {
        queryBuilder.andWhere('stallionlocation.stateId  IN (:...stateList)', {
          stateList: stateListData,
        });
      }
    }
    if (searchOptionsDto.yearToStud) {
      let yearToStud = searchOptionsDto.yearToStud.split('|');
      let yearToStudList = yearToStud.map((res) => parseInt(res));
      queryBuilder.andWhere('stallion.yearToStud  IN (:...yearToStud)', {
        yearToStud: yearToStudList,
      });
    }
    if (searchOptionsDto.colour) {
      let colour = searchOptionsDto.colour.split('|');
      let colourList = colour.map((res) => parseInt(res));
      queryBuilder.andWhere('colour.colourDominancyId IN (:...colour)', {
        colour: colourList,
      });
    }
    queryBuilder.orderBy(
      'CASE WHEN getutcdate() BETWEEN promotion.startDate AND promotion.endDate THEN 1 ELSE 0 END ',
      'DESC',
    );
    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      switch (sortBy.toLowerCase()) {
        case 'promoted':
          queryBuilder.addOrderBy(
            'CASE WHEN getutcdate() BETWEEN promotion.startDate AND promotion.endDate THEN 1 ELSE 0 END ',
            'DESC',
          );
          break;
        case 'stud fee':
          queryBuilder.addOrderBy('CASE WHEN stallionservicefee.isPrivateFee=0 THEN 1 ELSE 0 END', 'DESC');
          queryBuilder.addOrderBy('(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate))', 'DESC');
          break;
        case 'recently updated':
          queryBuilder.addOrderBy('stallion.modifiedOn', 'DESC');
          break;
        case 'available nominations':
          queryBuilder.addOrderBy('nomination.noOfNominations', 'DESC');
          break;
        case 'alphabetical':
          queryBuilder.addOrderBy('horse.horseName', 'ASC');
          break;
        default:
          queryBuilder.orderBy(
            'CASE WHEN getutcdate() BETWEEN promotion.startDate AND promotion.endDate THEN 1 ELSE 0 END',
            'DESC',
          );
      }
    }
    queryBuilder.addOrderBy('horse.horseName', 'ASC');

    if (searchOptionsDto.stallionName) {
      let searchName = searchOptionsDto.stallionName.replace(/[^a-zA-Z ]/g, '');
      const orderByCaseData =
        "CASE WHEN horse.horseName = '" +
        searchName +
        "' THEN 0 WHEN horse.horseName LIKE '" +
        searchName +
        "%' THEN 1 WHEN horse.horseName LIKE '%" +
        searchName +
        "%' THEN 2  WHEN horse.horseName LIKE '%" +
        searchName +
        "' THEN 3  ELSE 4 END";
      queryBuilder.orderBy(orderByCaseData, 'ASC');
      queryBuilder.addOrderBy('horse.horseName', 'ASC');
    }

    if (searchOptionsDto.priceRange) {
      const priceRange = searchOptionsDto.priceRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2) {
        let minPrice = priceList[0];
        let maxPrice = priceList[1];
        if (searchOptionsDto.isPrivateFee) {
          queryBuilder.andWhere(
            '(((stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) <= :maxPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1)',
            {
              minPrice,
              maxPrice,
            },
          );
        } else {
          queryBuilder.andWhere(
            '(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) <= :maxPrice AND stallionservicefee.isPrivateFee=0',
            {
              minPrice,
              maxPrice,
            },
          );
        }
      }
    } else {
      if(!searchOptionsDto.isPrivateFee) {
        queryBuilder.andWhere('stallionservicefee.isPrivateFee = :isPrivateFee', {
          isPrivateFee: 0,
        });
      }
    }

    queryBuilder
      .andWhere('stallion.isActive=:isActive', { isActive: 1 })
      .andWhere('stallion.isVerified=:isVerified', { isVerified: 1 });
    const entitiesWithoutLimit = await queryBuilder.getRawMany();
    let min = 0,
      max = 10000000;
    if (
      searchOptionsDto.colour ||
      searchOptionsDto.currency ||
      searchOptionsDto.damSireId ||
      searchOptionsDto.farmId ||
      searchOptionsDto.farmName ||
      searchOptionsDto.farms ||
      searchOptionsDto.location ||
      searchOptionsDto.priceRange ||
      searchOptionsDto.promoted ||
      searchOptionsDto.sireId ||
      searchOptionsDto.stallionId ||
      searchOptionsDto.stallionName ||
      searchOptionsDto.yearToStud ||
      searchOptionsDto.isExcludeKeyAncestor ||
      searchOptionsDto.isPrivateFee ||
      searchOptionsDto.keyAncestorId
    ) {
      min = Math.min(...entitiesWithoutLimit.map((item) => item.fee));
      max = Math.max(...entitiesWithoutLimit.map((item) => item.fee));
    }

    queryBuilder.offset(searchOptionsDto.skip).limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    let finalResult = new PageDto(entities, pageMetaDto);
    finalResult['priceRange'] = { max: max, min: min };
    return finalResult;
  }

  /* Get ShortlistedStallion By Member and Stallion */
  async findOne(memberId: number, stallionId: number) {
    return await this.stallionShortlistRepository.findOne({
      memberId,
      stallionId,
    });
  }

  /* Get Stallion From Shortlist */
  async remove(stallionId: string) {
    let stallionRecord = await this.stallionsService.findOne(stallionId);
    if (!stallionRecord) {
      throw new UnprocessableEntityException('Stallion not exist!');
    }
    const member = this.request.user;
    return this.stallionShortlistRepository.delete({
      stallionId: stallionRecord.id,
      memberId: member['id'],
    });
  }

  /* Get ShortlistedStallion Count */
  async getSSCountByMemberId(memberId: number) {
    return await this.stallionShortlistRepository.count({ memberId });
  }

  /* Get All Shortlisted stallions */
  async getAllShortlistedStallions() {
    const member = this.request.user;
    const queryBuilder = this.stallionShortlistRepository
      .createQueryBuilder('stallionshortlist')
      .select('stallion.stallionUuid as stallionId')
      .innerJoin('stallionshortlist.stallion', 'stallion')
      .andWhere('stallionshortlist.memberId = :memberId', {
        memberId: member['id'],
      });

    queryBuilder
      .andWhere('stallion.isActive=:isActive', { isActive: 1 })
      .andWhere('stallion.isVerified=:isVerified', { isVerified: 1 });

    return await queryBuilder.getRawMany();
  }
}
