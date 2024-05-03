import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CountryResponseDto } from 'src/country/dto/country-response.dto';
import { Country } from 'src/country/entity/country.entity';
import { HorseProfileImage } from 'src/horse-profile-image/entities/horse-profile-image.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { Runner } from 'src/runner/entities/runner.entity';
import { SearchStallionMatch } from 'src/search-stallion-match/entities/search-stallion-match.entity';
import { StallionProfileImage } from 'src/stallion-profile-image/entities/stallion-profile-image.entity';
import { StallionServiceFee } from 'src/stallion-service-fees/entities/stallion-service-fee.entity';
import { CountryDto } from 'src/stallions/dto/country-filter.dto';
import { SearchTopMostOptionDto } from 'src/stallions/dto/search-top-most-option.dto';
import { TopMostStallionResponseDto } from 'src/stallions/dto/top-most-stallion-response.dto';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { getRepository } from 'typeorm';
import { SearchMostMatchedDamSireOptionDto } from './dto/search-most-matched-dam-sire-option.dto';

@Injectable({ scope: Scope.REQUEST })
export class StallionTrendsService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  async findTopPerformingStallion(
    searchOptionsDto: SearchTopMostOptionDto,
  ): Promise<TopMostStallionResponseDto> {
    let data = await getRepository(SearchStallionMatch).manager.query(
      `EXEC proc_SMPTopPerformingStallion 
        @pCountryId=@0,
        @pFromDate=@1,
        @pToDate=@2`,
      [
        searchOptionsDto.countryId,
        new Date(searchOptionsDto.fromDate), //'2011-01-01',
        new Date(searchOptionsDto.toDate), //'2012-12-01',
      ],
    );
    if (data.length > 0) {
      return data[0];
    }
    return;
  }
  async findAllRecent() {}

  async findSinglePopularStallion(
    searchPopularOptionsDto: SearchTopMostOptionDto,
  ): Promise<TopMostStallionResponseDto> {
    4;

    let scntQuery = getRepository(SearchStallionMatch)
      .createQueryBuilder('ssm')
      .select('ssm.stallionId, count(ssm.stallionId) as searchCount')
      .innerJoin('ssm.stallion', 'stallion')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .leftJoin('stallion.farm', 'farm')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .andWhere('stallionlocation.countryId=:countryId', {
        countryId: searchPopularOptionsDto.countryId,
      })
      .groupBy('ssm.stallionId');

    if (searchPopularOptionsDto.fromDate && searchPopularOptionsDto.toDate) {
      scntQuery.andWhere('ssm.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: await this.setHoursZero(searchPopularOptionsDto.fromDate),
        toDate: await this.setToMidNight(searchPopularOptionsDto.toDate),
      });
    } else {
      let fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      scntQuery.andWhere('ssm.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: await this.setHoursZero(fromDate),
        toDate: await this.setToMidNight(new Date()),
      });
    }

    scntQuery.orderBy('searchCount', 'DESC');

    const mostSearched = await scntQuery.getRawOne();
    if (!mostSearched) {
      return null;
    }

    let spiQueryBuilder = getRepository(StallionProfileImage)
      .createQueryBuilder('spi')
      .select(
        'spi.stallionId as mediaStallionId, media.mediaUrl as profileMediaUrl',
      )
      .innerJoin(
        'spi.media',
        'media',
        'media.id=spi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

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

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    const location =
      'stlocation.countryId = ' + searchPopularOptionsDto.countryId;

    let scnthQuery = getRepository(Stallion)
      .createQueryBuilder('st')
      .select('st.horseId as horseId, count(st.horseId) stallionCount')
      .innerJoin('st.stallionlocation', 'stlocation')
      .innerJoin('st.horse', 'horse', 'horse.isVerified=1 AND horse.isActive=1')
      .andWhere('st.isActive = 1 AND st.isVerified = 1')
      .andWhere(location)
      .groupBy('st.horseId');

    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select(
        'stallion.stallionUuid as stallionId, profileMediaUrl as profilePic, stallionCount',
      )
      .addSelect('horse.horseName as horseName')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .addSelect('stallionservicefee.fee as fee')
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .leftJoin('stallion.farm', 'farm')
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      )
      .innerJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=promotion.id',
      )
      .leftJoin(
        '(' + scnthQuery.getQuery() + ')',
        'hc',
        'stallion.horseId=hc.horseId',
      )
      .innerJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .innerJoin('stallionservicefee.currency', 'currency')
      .andWhere('stallion.id = :id', { id: mostSearched['stallionId'] });

    const entities = await queryBuilder.getRawOne();

    return entities;
  }

  async findPopularDamSire(searchOptionsDto: SearchTopMostOptionDto) {
    let scntQuery = getRepository(SearchStallionMatch)
      .createQueryBuilder('ssm')
      .select('ssm.mareId, count(ssm.mareId) as searchCount');

    if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
      scntQuery.andWhere('ssm.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: await this.setHoursZero(searchOptionsDto.fromDate),
        toDate: await this.setToMidNight(searchOptionsDto.toDate),
      });
    }

    scntQuery.groupBy('ssm.mareId');

    let sQueryBuilder = getRepository(Horse)
      .createQueryBuilder('horse')
      .select(
        'horse.id as horseId, horse.sireId as sireId, horse.isVerified as isHorseVerified, horse.countryId as cob',
      );

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('horse')
      .select('horse.id as dId, horse.horseName as damName');

    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('horse')
      .select('horse.id as sId, horse.horseName as sireName');

    let hpiQueryBuilder = getRepository(HorseProfileImage)
      .createQueryBuilder('hpi')
      .select('hpi.horseId as mediaHorseId, media.mediaUrl as profileMediaUrl')
      .innerJoin(
        'hpi.media',
        'media',
        'media.id=hpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    let queryBuilder = getRepository(Horse)
      .createQueryBuilder('damSire')
      .select(
        'DISTINCT(damSire.horseUuid) as horseUuid, damSire.horseName as horseName, horseId, damName, sireName, profileMediaUrl as profilePic, isHorseVerified, cob',
      )
      .innerJoin(
        '(' + sQueryBuilder.getQuery() + ')',
        'mare',
        'mare.sireId = damSire.id',
      )
      .innerJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'dId = damSire.damId',
      )
      .innerJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sId = damSire.sireId',
      )
      .leftJoin(
        '(' + hpiQueryBuilder.getQuery() + ')',
        'horseprofileimage',
        'mediaHorseId=damSire.id',
      );

    let scnSearchtQuery = getRepository(SearchStallionMatch)
      .createQueryBuilder('ssmt')
      .select(
        'DISTINCT(horseUuid), searchCount, horseName, damName, sireName, profilePic',
      )
      .innerJoin(
        '(' + scntQuery.getQuery() + ')',
        'scnt',
        'scnt.mareId = ssmt.mareId',
      )
      .innerJoin(
        '(' + queryBuilder.getQuery() + ')',
        'mares',
        'mares.horseId = ssmt.mareId',
      )
      .andWhere('mares.isHorseVerified = 1 AND mares.cob = :countryId', {
        countryId: searchOptionsDto.countryId,
      });

    if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
      scnSearchtQuery.andWhere('ssmt.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: await this.setHoursZero(searchOptionsDto.fromDate),
        toDate: await this.setToMidNight(searchOptionsDto.toDate),
      });
    } else {
      let fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      scntQuery.andWhere('ssmt.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: await this.setHoursZero(fromDate),
        toDate: await this.setToMidNight(new Date()),
      });
    }
    scnSearchtQuery.orderBy('searchCount', 'DESC');

    const entities = await scnSearchtQuery.getRawOne();

    return entities;
  }

  async findMostMatchedDamSire(
    searchOptionsDto: SearchMostMatchedDamSireOptionDto,
  ) {
    if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
      return await getRepository(SearchStallionMatch).manager.query(
        `EXEC procGetTrendsMostMatchedDamSires
          @paramDate1=@0,
          @paramDate2=@1,
          @countryId=@2`,
        [
          searchOptionsDto.fromDate,
          searchOptionsDto.toDate,
          searchOptionsDto.countryId,
        ],
      );
    }
    let fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    return await getRepository(SearchStallionMatch).manager.query(
      `EXEC procGetTrendsMostMatchedDamSires
        @paramDate1=@0,
        @paramDate2=@1,
        @countryId=@2`,
      [
        await this.setHoursZero(fromDate),
        await this.setToMidNight(new Date()),
        searchOptionsDto.countryId,
      ],
    );
  }

  async setToMidNight(date) {
    date = new Date(date);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  async setHoursZero(date) {
    date = new Date(date);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  async findHottestCross(searchOption: CountryDto) {
    let wQuery = getRepository(Runner)
      .createQueryBuilder('winner')
      .select('winner.horseId as wHorseId, count(winner.horseId) as totalWin')
      .innerJoin('winner.positions', 'positions', 'positions.position = 1')
      .innerJoin('winner.races', 'race')
      .groupBy('winner.horseId');

    let rQuery = getRepository(Runner)
      .createQueryBuilder('t1')
      .select('t1.horseId as rHorseId, count(t1.horseId) as totalRunner')
      .innerJoin('t1.races', 'race')
      .groupBy('t1.horseId');

    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('horse')
      .select('horse.id as sirId, horse.horseName as sireName');

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('horse')
      .select('horse.id as dmId, horse.horseName as damName');

    let nQuery = getRepository(Runner)
      .createQueryBuilder('winner')
      .select('winner.horseId as hId')
      .addSelect('horse.sireId as sId, horse.damId as dId')
      .innerJoin('winner.races', 'race')
      .innerJoin('winner.horse', 'horse');

    let rcntQuery = getRepository(Runner)
      .createQueryBuilder('ruuner')
      .select(
        'DISTINCT(ruuner.horseId), totalWin, totalRunner, horse.horseName as horseName, sirId, sireName, dmId, damName',
      )
      .innerJoin('ruuner.horse', 'horse', 'horse.sex = :sex', { sex: 'M' })
      .innerJoin(
        '(' + wQuery.getQuery() + ')',
        'win',
        'wHorseId=ruuner.horseId',
      )
      .innerJoin(
        '(' + rQuery.getQuery() + ')',
        'run',
        'rHorseId=ruuner.horseId',
      )
      .innerJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sirId=horse.sireId',
      )
      .innerJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'dmId=horse.damId',
      )
      // .innerJoin("(" + nQuery.getQuery() + ")", 'cw', 'sId = sirId AND dId = dmId')
      .innerJoin('ruuner.races', 'race', 'ruuner.raceId IS NOT NULL')
      .andWhere('wHorseId = rHorseId')
      .orderBy('totalWin', 'DESC');

    var fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    rcntQuery.andWhere(
      'ruuner.createdOn >= :fromDate AND ruuner.createdOn <= :toDate',
      {
        fromDate: fromDate,
        toDate: new Date(),
      },
    );

    if (searchOption.countryId) {
      rcntQuery.andWhere('horse.countryId = :countryId', {
        countryId: searchOption.countryId,
      });
    }

    const hottestCross = await rcntQuery.getRawMany();

    return hottestCross;
  }

  // To get the country list in Which Stallion is available.
  async getStallionsCountries(): Promise<CountryResponseDto[]> {
    const queryBuilder = getRepository(Country)
      .createQueryBuilder('country')
      .select(
        'DISTINCT country.id as id, country.countryName, country.countryCode, country.countryA2Code, country.regionId, country.preferredCurrencyId, country.isDisplay',
      )
      .innerJoin('country.stallionLocation', 'stallionLocation')
      .innerJoin('stallionLocation.stallion', 'stallion')
      .orderBy('country.countryName', 'ASC');

    const response = await queryBuilder.getRawMany();
    return response;
  }
}
