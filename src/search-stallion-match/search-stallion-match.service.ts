import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as requestIp from 'request-ip';
import { BreederStallionMatchActivityDto } from 'src/breeder-report/dto/breeder-stallion-match-activity.dto';
import { SearchMatchedMareDto } from 'src/breeder-report/dto/search-matched-mares.dto';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { Farm } from 'src/farms/entities/farm.entity';
import { FarmsService } from 'src/farms/farms.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { HtmlToPdfService } from 'src/file-uploads/html-to-pdf.service';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { PageView } from 'src/page-view/entities/page-view.entity';
import { StallionGalleryImage } from 'src/stallion-gallery-images/entities/stallion-gallery-image.entity';
import { StallionProfileImage } from 'src/stallion-profile-image/entities/stallion-profile-image.entity';
import { StallionReportSearchOptionDto } from 'src/stallion-report/dto/search-options.dto';
import { FarmStallionMatchedActivitySearchOptionDto } from 'src/stallion-trends/dto/farm-stallion-match-activity-search.dto';
import { StallionTrendsSearchOptionDto } from 'src/stallion-trends/dto/search-options.dto';
import { TopMatchedSiresDto } from 'src/stallion-trends/dto/top-matched.dto';
import { CountryDto } from 'src/stallions/dto/country-filter.dto';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { StallionActivitySort } from 'src/utils/constants/stallions';
import { Repository, getRepository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { BreederRecentSearchRespose } from './dto/breeder-recent-search-response.dto';
import { CreateSmSearchDto } from './dto/create-sm-search.dto';
import { RecentSearchRespose } from './dto/recent-search-response.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { SearchStallionMatch } from './entities/search-stallion-match.entity';
import { ShareSMSearchResultAuthDto } from './dto/share-sm-search-result-auth.dto';
import { Member } from 'src/members/entities/member.entity';
import { ShareSMSearchResultPublicDto } from './dto/share-sm-search-result-public.dto';
import { MailService } from 'src/mail/mail.service';

const DottedMap = require('dotted-map').default;

@Injectable({ scope: Scope.REQUEST })
export class SearchStallionMatchService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(SearchStallionMatch)
    private smRepository: Repository<SearchStallionMatch>,
    readonly fileUploadsService: FileUploadsService,
    readonly htmlToPdfService: HtmlToPdfService,
    readonly configService: ConfigService,
    readonly farmsService: FarmsService,
    readonly commonUtilsService: CommonUtilsService,
    readonly mailService: MailService,
  ) {}

  /* Create a Record */
  async create(createSmSearch: CreateSmSearchDto) {
    const member = this.request.user;
    const ipAddress = requestIp.getClientIp(this.request);
    createSmSearch.userAgent = this.request.headers['user-agent'];
    createSmSearch.ipAddress = ipAddress;
    if (member) {
      createSmSearch.createdBy = member['id'];
    }
    return this.smRepository.save(this.smRepository.create(createSmSearch));
  }

  /* Get all records with Counts */
  async findAllWithCounts(searchOptions: SearchOptionsDto) {
    let finalData = await this.smRepository.manager.query(
      `EXEC procGetTrendsMostSearchedStallions
        @paramDate1=@0,
        @paramDate2=@1,
        @countryId=@2`,
      [searchOptions.fromDate, searchOptions.toDate, searchOptions.countryId],
    );

    return {
      data: finalData,
    };
  }

  /* Get all latest records */
  async findAllRecent(pageLimit = 12): Promise<RecentSearchRespose[]> {
    const member = this.request.user;
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

    let scntinnerQuery = getRepository(SearchStallionMatch)
      .createQueryBuilder('ssm')
      .select('MAX(ssm.id)')
      .andWhere('ssm.createdBy = :createdBy', { createdBy: member['id'] })
      .addGroupBy('ssm.stallionId')
      .addGroupBy('ssm.mareId');

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    let queryBuilder = getRepository(SearchStallionMatch)
      .createQueryBuilder('ssmt')
      .select(
        'stallion.stallionUuid as stallionId, horse.horseName as stallionName, mare.horseUuid as mareId, mare.horseName as mareName, profileMediaUrl as profilePic, sgiMedia.mediaUrl as galleryImage,ssmt.createdOn',
      )
      .addSelect(
        'country.countryCode as stallionCountryCode, mareCountry.countryCode as mareCountryCode, mare.yob as mareYob',
      )
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END as isPromoted',
      )
      .andWhere('ssmt.id IN (' + scntinnerQuery.getQuery() + ')')
      .innerJoin('ssmt.stallion', 'stallion')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .innerJoin('horse.nationality', 'country')
      .innerJoin('ssmt.mare', 'mare')
      .innerJoin('mare.nationality', 'mareCountry')
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
      .leftJoin('tblMedia', 'sgiMedia', 'sgiMedia.id=sgi.sgiMediaId')
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=promotion.id',
      )
      .andWhere('stallion.isVerified = :isVerified', { isVerified: 1 })
      .andWhere('stallion.isActive = :isActive', { isActive: 1 })
      .setParameters(scntinnerQuery.getParameters())
      .orderBy('ssmt.createdOn', 'DESC');

    queryBuilder.offset(0).limit(pageLimit);

    const entities = await queryBuilder.getRawMany();
    const keys = ['stallionId'];
    let filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );
    return filtered;
  }

  /* Get all latest records */
  async findAllRecentSearches(
    pageLimit = 12,
  ): Promise<BreederRecentSearchRespose[]> {
    const member = this.request.user;

    let queryBuilder = getRepository(SearchStallionMatch)
      .createQueryBuilder('ssmt')
      .select(
        `stallion.stallionUuid as stallionId, horse.horseName as stallionName, mare.horseUuid as mareId, mare.horseName as mareName, ssmt.createdOn, 
        CASE 
          WHEN ssmt.isPerfectMatch=1 THEN 'PM' 
          ELSE CASE WHEN ssmt.isTwentytwentyMatch=1 THEN '20/20' 
          ELSE CASE WHEN ssmt.isPerfectMatch=0 AND ssmt.isTwentytwentyMatch=0 THEN '-' END
         END
        END
        as matchResult`,
      )
      .innerJoin('ssmt.stallion', 'stallion')
      .innerJoin(
        'stallion.horse',
        'horse',
        "horse.isVerified=1 AND horse.isActive=1 AND horse.sex='M'",
      )
      .innerJoin('horse.horsetype', 'horsetype', 'horsetype.isEligible=1')
      .innerJoin('horse.nationality', 'country')
      .innerJoin(
        'ssmt.mare',
        'mare',
        "mare.isVerified=1 AND mare.isActive=1 AND mare.sex='F'",
      )
      .andWhere('stallion.isVerified = :isVerified', { isVerified: 1 })
      .andWhere('stallion.isActive = :isActive', { isActive: 1 })
      .andWhere('ssmt.createdBy = :createdBy', { createdBy: member['id'] })
      .orderBy('ssmt.createdOn', 'DESC');

    queryBuilder.offset(0).limit(pageLimit);

    return await queryBuilder.getRawMany();
  }

  /* Get Top Matched Sires */
  async findTopMatchedSires(searchOption: TopMatchedSiresDto) {
    const finalData = await this.smRepository.manager.query(
      `EXEC proc_SMPStallionTrendsTop10Perfect2020MatchedSire
      @pCountryId=@0, @IsPerfect2020=@1`,
      [searchOption.countryId, 0],
    );

    finalData.map((item) => {
      item['isPromoted'] = item.IsPromoted;
      delete item.IsPromoted;
    });

    if (searchOption.sortBy) {
      const sortBy = searchOption.sortBy.toLowerCase();
      switch (sortBy.toLowerCase()) {
        case 'name':
          finalData.sort(function (a, b) {
            return a.horseName - b.horseName;
          });
          break;
        case 'runners':
          finalData.sort(function (a, b) {
            return a.TotalRunners - b.TotalRunners;
          });
          break;
        case 'stakes winners':
          finalData.sort(function (a, b) {
            return a.TotalStakeWinners - b.TotalStakeWinners;
          });
          break;
        case 'sw/rnrs %':
          finalData.sort(function (a, b) {
            return a.Perc - b.Perc;
          });
          break;
        default:
          finalData.sort(function (a, b) {
            return a.horseName - b.horseName;
          });
      }
    }

    return finalData;
  }

  /* Get Top Matched BroodmareSires */
  async findTopMatchedBroodmareSires(searchOption: TopMatchedSiresDto) {
    const finalData = await this.smRepository.manager.query(
      `EXEC proc_SMPStallionTrendsTop10Perfect2020MatchedBroodMareSire
      @pCountryId=@0, @IsPerfect2020=@1`,
      [searchOption.countryId, 0],
    );

    if (searchOption.sortBy) {
      const sortBy = searchOption.sortBy.toLowerCase();
      switch (sortBy.toLowerCase()) {
        case 'name':
          finalData.sort(function (a, b) {
            return a.horseName - b.horseName;
          });
          break;
        case 'runners':
          finalData.sort(function (a, b) {
            return a.TotalRunners - b.TotalRunners;
          });
          break;
        case 'stakes winners':
          finalData.sort(function (a, b) {
            return a.TotalStakeWinners - b.TotalStakeWinners;
          });
          break;
        case 'sw/rnrs %':
          finalData.sort(function (a, b) {
            return a.Perc - b.Perc;
          });
          break;
        default:
          finalData.sort(function (a, b) {
            return a.horseName - b.horseName;
          });
      }
    }

    return finalData;
  }

  /* Get Top Perfect Matched Sires */
  async findTopPerfectMatchedSires(searchOption: TopMatchedSiresDto) {
    const finalData = await this.smRepository.manager.query(
      `EXEC proc_SMPStallionTrendsTop10Perfect2020MatchedSire
      @pCountryId=@0, @IsPerfect2020=@1`,
      [searchOption.countryId, 1],
    );

    finalData.map((item) => {
      item['isPromoted'] = item.IsPromoted;
      delete item.IsPromoted;
    });

    if (searchOption.sortBy) {
      const sortBy = searchOption.sortBy.toLowerCase();
      switch (sortBy.toLowerCase()) {
        case 'name':
          finalData.sort(function (a, b) {
            return a.horseName - b.horseName;
          });
          break;
        case 'runners':
          finalData.sort(function (a, b) {
            return a.TotalRunners - b.TotalRunners;
          });
          break;
        case 'stakes winners':
          finalData.sort(function (a, b) {
            return a.TotalStakeWinners - b.TotalStakeWinners;
          });
          break;
        case 'sw/rnrs %':
          finalData.sort(function (a, b) {
            return a.Perc - b.Perc;
          });
          break;
        default:
          finalData.sort(function (a, b) {
            return a.horseName - b.horseName;
          });
      }
    }

    return finalData;
  }

  /* Get All Top Perfect Matched BroodmareSires */
  async findTopPerfectMatchedBroodmareSires(searchOption: TopMatchedSiresDto) {
    const finalData = await this.smRepository.manager.query(
      `EXEC proc_SMPStallionTrendsTop10Perfect2020MatchedBroodMareSire
      @pCountryId=@0, @IsPerfect2020=@1`,
      [searchOption.countryId, 1],
    );

    if (searchOption.sortBy) {
      const sortBy = searchOption.sortBy.toLowerCase();
      switch (sortBy.toLowerCase()) {
        case 'name':
          finalData.sort(function (a, b) {
            return a.horseName - b.horseName;
          });
          break;
        case 'runners':
          finalData.sort(function (a, b) {
            return a.TotalRunners - b.TotalRunners;
          });
          break;
        case 'stakes winners':
          finalData.sort(function (a, b) {
            return a.TotalStakeWinners - b.TotalStakeWinners;
          });
          break;
        case 'sw/rnrs %':
          finalData.sort(function (a, b) {
            return a.Perc - b.Perc;
          });
          break;
        default:
          finalData.sort(function (a, b) {
            return a.horseName - b.horseName;
          });
      }
    }

    return finalData;
  }

  /* Get Hottest Cross */
  async findHottestCross(searchOption: CountryDto) {
    const finalData = await this.smRepository.manager.query(
      `EXEC proc_SMPHottestCross
      @pCountryId=@0`,
      [searchOption.countryId],
    );

    return finalData;
  }

  /* Get all stallionMatch Activity */
  async stallionMatchActivity(searchOptionsDto: StallionReportSearchOptionDto) {
    const stallionResopnse = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as id')
      .andWhere('stallion.stallionUuid=:stallionId', {
        stallionId: searchOptionsDto.stallionId,
      })
      .getRawOne();

    if (!stallionResopnse) {
      throw new HttpException('Stallion not found', HttpStatus.NOT_FOUND);
    }
    let fromDate = new Date(); //applicable to today
    let toDate = new Date();
    const curr = new Date(); // get current date
    var groupByUsing = 'Month(ssm.createdOn)';
    let xKey = '';
    let daysOrMonthOrYear = [];
    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'today') {
        fromDate = new Date();
        toDate = new Date();
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
        daysOrMonthOrYear = [fromDate.getDate()];
      }
      if (filterBy.toLowerCase() === 'this month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
        toDate = curr;
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
        daysOrMonthOrYear = await this.addMissingDaysOrMonthOrYear(
          fromDate,
          toDate,
          xKey,
        );
      }
      if (filterBy.toLowerCase() === 'this week') {
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        fromDate = new Date(curr.setDate(first));
        toDate = new Date();
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
        daysOrMonthOrYear = await this.addMissingDaysOrMonthOrYear(
          fromDate,
          toDate,
          xKey,
        );
      }
      if (filterBy.toLowerCase() === 'this year') {
        fromDate = new Date(curr.getFullYear(), 0, 1);
        // toDate = new Date(curr.getFullYear(), 11, 31);
        toDate = curr;
        groupByUsing = 'Month(ssm.createdOn)';
        xKey = 'months';
        daysOrMonthOrYear = await this.addMissingDaysOrMonthOrYear(
          fromDate,
          toDate,
          xKey,
        );
      }
      if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
          let fromYear = fromDate.getFullYear(),
            toYear = toDate.getFullYear();
          let fromMonth = fromDate.getMonth(),
            toMonth = toDate.getMonth();
          if (fromYear == toYear) {
            if (fromMonth == toMonth) {
              xKey = 'days';
              groupByUsing = 'Day(ssm.createdOn)';
            } else {
              xKey = 'months';
              groupByUsing = 'Month(ssm.createdOn)';
            }
          } else {
            xKey = 'years';
            groupByUsing = 'Year(ssm.createdOn)';
          }
          daysOrMonthOrYear = await this.addMissingDaysOrMonthOrYear(
            fromDate,
            toDate,
            xKey,
          );
        }
      }
    }

    const smSearchesQuery = await getRepository(SearchStallionMatch)
      .createQueryBuilder('ssm')
      .select(
        'COUNT(ssm.id) as smSearches, SUM(CASE WHEN ssm.isTwentytwentyMatch = 1 THEN 1 ELSE 0 END) as ttMatches, SUM(CASE WHEN ssm.isPerfectMatch = 1 THEN 1 ELSE 0 END) as perfectMatches, ' +
          groupByUsing +
          ' as createdOn ',
      )
      .andWhere('ssm.stallionId=:stallionId', {
        stallionId: stallionResopnse.id,
      })
      .andWhere('ssm.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: await this.commonUtilsService.setHoursZero(fromDate),
        toDate: await this.commonUtilsService.setToMidNight(toDate),
      })
      .addGroupBy(groupByUsing)
      .addOrderBy(groupByUsing, 'ASC')
      .getRawMany();

    let totalSmSearches = 0,
      totalTtMatches = 0,
      totalPerfectMatches = 0;
    smSearchesQuery.forEach((element) => {
      totalSmSearches = totalSmSearches + element.smSearches;
      totalTtMatches = totalTtMatches + element.ttMatches;
      totalPerfectMatches = totalPerfectMatches + element.perfectMatches;
    });

    let newSmSearchesList = [];
    for (var item of daysOrMonthOrYear) {
      let isAvailable = smSearchesQuery.find((a) => {
        return a.createdOn == item;
      });
      if (isAvailable) {
        newSmSearchesList.push(isAvailable);
      } else {
        newSmSearchesList.push({
          smSearches: 0,
          ttMatches: 0,
          perfectMatches: 0,
          createdOn: item,
        });
      }
    }
    return [
      {
        data: newSmSearchesList,
        xKey,
        totalSmSearches,
        totalTtMatches,
        totalPerfectMatches,
      },
    ];
  }

  // add missing data with 0
  async addMissingDaysOrMonthOrYear(fromDate, toDate, xKey) {
    let daysOrMonthOrYear = [];
    let start, end;
    if (xKey === 'days') {
      start = fromDate.getDate();
      end = toDate.getDate();
      if (start > end) {
        let y = fromDate.getFullYear(),
          m = fromDate.getMonth();
        let lastDay = new Date(y, m + 1, 0).getDate();
        for (let i = start; i <= lastDay; i++) {
          daysOrMonthOrYear.push(i);
        }
        for (let i = 1; i <= end; i++) {
          daysOrMonthOrYear.push(i);
        }
      } else {
        for (let i = start; i <= end; i++) {
          daysOrMonthOrYear.push(i);
        }
      }
    } else {
      if (xKey === 'months') {
        start = fromDate.getMonth() + 1;
        end = toDate.getMonth() + 1;
      } else if (xKey == 'years') {
        start = fromDate.getFullYear();
        end = toDate.getFullYear();
      }
      for (let i = start; i <= end; i++) {
        daysOrMonthOrYear.push(i);
      }
    }
    return daysOrMonthOrYear;
  }

  /* Get all stallionMatch Activity For Trends */
  async stallionMatchActivityForTrends(
    searchOptionsDto: StallionTrendsSearchOptionDto,
  ) {
    let fromDate = new Date(); //applicable to today
    let toDate = new Date();
    const curr = new Date(); // get current date
    let xKey = '';
    var groupByUsing = 'Month(ssm.createdOn)';
    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'today') {
        fromDate = new Date();
        toDate = new Date();
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
      } else if (filterBy.toLowerCase() === 'this month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
        toDate = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
      } else if (filterBy.toLowerCase() === 'this week') {
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        var last = first + 6; // last day is the first day + 6
        fromDate = new Date(curr.setDate(first));
        toDate = new Date(curr.setDate(last));
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
      } else if (filterBy.toLowerCase() === 'this year') {
        fromDate = new Date(curr.getFullYear(), 0, 1);
        toDate = new Date(curr.getFullYear(), 11, 31);
        groupByUsing = 'Month(ssm.createdOn)';
        xKey = 'months';
      } else if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
          groupByUsing = 'Month(ssm.createdOn)';
          xKey = 'months';
        }
      }
    }

    const smSearchesQuery = await getRepository(SearchStallionMatch)
      .createQueryBuilder('ssm')
      .select(
        'COUNT(ssm.id) as smSearches, SUM(CASE WHEN ssm.isTwentytwentyMatch = 1 THEN 1 ELSE 0 END) as ttMatches, SUM(CASE WHEN ssm.isPerfectMatch = 1 THEN 1 ELSE 0 END) as perfectMatches, ' +
          groupByUsing +
          ' as createdOn ',
      )
      // .innerJoin('ssm.stallion','stallion')
      // .innerJoin('stallion.stallionlocation','location')
      // .andWhere("ssm.stallionId=:stallionId", {'stallionId': stallionResopnse.id})
      .andWhere('ssm.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: await this.commonUtilsService.setHoursZero(fromDate),
        toDate: await this.commonUtilsService.setToMidNight(toDate),
      })
      // .andWhere('location.countryId = :countryId',{countryId: searchOptionsDto.countryId})
      .addGroupBy(groupByUsing)
      .addOrderBy(groupByUsing, 'ASC')
      .getRawMany();
    let totalSmSearches = 0,
      totalTtMatches = 0,
      totalPerfectMatches = 0;
    smSearchesQuery.forEach((element) => {
      totalSmSearches = totalSmSearches + element.smSearches;
      totalTtMatches = totalTtMatches + element.ttMatches;
      totalPerfectMatches = totalPerfectMatches + element.perfectMatches;
    });

    return [
      {
        data: smSearchesQuery,
        xKey,
        totalSmSearches,
        totalTtMatches,
        totalPerfectMatches,
      },
    ];
  }

  /* Get All Farm StallionMatch Activity */
  async farmStallionMatchActivity(
    searchOptionsDto: FarmStallionMatchedActivitySearchOptionDto,
  ) {
    let fromDate = new Date(); //applicable to today
    let toDate = new Date();
    let xKey = '';
    const curr = new Date(); // get current date
    var groupByUsing = 'Month(ssm.createdOn)';
    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'this month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
        toDate = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
      }
      if (filterBy.toLowerCase() === 'last month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth() - 1, 1);
        toDate = new Date(curr.getFullYear(), curr.getMonth(), 0);
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
      }
      if (filterBy.toLowerCase() === 'this year') {
        fromDate = new Date(curr.getFullYear(), 0, 1);
        toDate = new Date(curr.getFullYear(), 11, 31);
        groupByUsing = 'Month(ssm.createdOn)';
        xKey = 'months';
      }
      if (filterBy.toLowerCase() === 'last year') {
        let lastYear = curr.getFullYear() - 1;
        fromDate = new Date(lastYear, 0, 1);
        toDate = new Date(lastYear, 11, 31);
        groupByUsing = 'Month(ssm.createdOn)';
        xKey = 'months';
      }
      if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
          groupByUsing = 'Month(ssm.createdOn)';
          xKey = 'months';
        }
      }
    }
    fromDate = await this.commonUtilsService.setHoursZero(fromDate);
    toDate = await this.commonUtilsService.setToMidNight(toDate);
    let stallionIds = [];
    if (searchOptionsDto.farmId) {
      let stallionIdsListFromDB =
        await this.farmsService.getAllStallionIdsByFarmId(
          searchOptionsDto.farmId,
        );
      await stallionIdsListFromDB.reduce(async (promise, element) => {
        await promise;
        stallionIds.push(element.stallionId);
      }, Promise.resolve());
      if (!stallionIds.length) {
        return [{ data: [], xKey }];
      }
    }
    let smSearchesQuery = getRepository(SearchStallionMatch)
      .createQueryBuilder('ssm')
      .select(
        'COUNT(ssm.id) as smSearches, SUM(CASE WHEN ssm.isTwentytwentyMatch = 1 THEN 1 ELSE 0 END) as ttMatches, SUM(CASE WHEN ssm.isPerfectMatch = 1 THEN 1 ELSE 0 END) as perfectMatches, ' +
          groupByUsing +
          ' as createdOn ',
      )
      .andWhere('ssm.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: fromDate,
        toDate: toDate,
      });
    if (stallionIds.length) {
      smSearchesQuery.andWhere('ssm.stallionId  IN (:...stallions)', {
        stallions: stallionIds,
      });
    }
    let data = await smSearchesQuery
      .addGroupBy(groupByUsing)
      .addOrderBy(groupByUsing, 'ASC')
      .getRawMany();

    return [{ data: data, xKey }];
  }

  /* Get Stallion Activity */
  async findStallionActivity(
    searchOptionsDto: FarmStallionMatchedActivitySearchOptionDto,
  ) {
    let fromDate = new Date(new Date().setUTCHours(0, 0, 0, 0)); //applicable to today
    let toDate = new Date(new Date().setUTCHours(23, 59, 59, 999));
    let xKey = '';
    const curr = new Date(); // get current date
    var groupByUsing = 'Month(ssm.createdOn)';
    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'this month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
        toDate = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
      }
      if (filterBy.toLowerCase() === 'last month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth() - 1, 1);
        toDate = new Date(curr.getFullYear(), curr.getMonth(), 0);
        groupByUsing = 'Day(ssm.createdOn)';
        xKey = 'days';
      }
      if (filterBy.toLowerCase() === 'this year') {
        fromDate = new Date(curr.getFullYear(), 0, 1);
        toDate = new Date(curr.getFullYear(), 11, 31);
        groupByUsing = 'Month(ssm.createdOn)';
        xKey = 'months';
      }
      if (filterBy.toLowerCase() === 'last year') {
        let lastYear = curr.getFullYear() - 1;
        fromDate = new Date(lastYear, 0, 1);
        toDate = new Date(lastYear, 11, 31);
        groupByUsing = 'Month(ssm.createdOn)';
        xKey = 'months';
      }
      if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
          groupByUsing = 'Month(ssm.createdOn)';
          xKey = 'months';
        }
      }
    }
    fromDate = await this.commonUtilsService.setHoursZero(fromDate);
    toDate = await this.commonUtilsService.setToMidNight(toDate);

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

    let scntQuery = getRepository(SearchStallionMatch)
      .createQueryBuilder('ssm')
      .select(
        'ssm.stallionId, count(ssm.stallionId) searchCount, SUM(CASE WHEN ssm.isTwentytwentyMatch = 1 THEN 1 ELSE 0 END) as ttMatches, SUM(CASE WHEN ssm.isPerfectMatch = 1 THEN 1 ELSE 0 END) as perfectMatches',
      )
      .andWhere('ssm.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: fromDate,
        toDate: toDate,
      })
      .groupBy('ssm.stallionId');

    let pvQueryBuilder = getRepository(PageView)
      .createQueryBuilder('pv')
      .select('pv.entityId as pageViewStallionId, COUNT(pv.entityId) pageCount')
      .andWhere('pv.entityType=:entityType', { entityType: 'STALLION' })
      .andWhere('pv.createdOn BETWEEN :fromDate AND :toDate', {
        fromDate: fromDate,
        toDate: toDate,
      })
      .groupBy('pv.entityId');

    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select(
        'DISTINCT(stallion.stallionUuid) as stallionId, horse.horseName as stallionName,farm.farmName as farmName, farm .id as farmId ,farm.farmUuid as farmUuid, mediaUrl as profilePic, scnt.searchCount, scnt.ttMatches, scnt.perfectMatches, pvq.pageCount as pageViews',
      )
      .addSelect(
        'CASE WHEN promotion.startDate >= :fromDate AND promotion.endDate <= :toDate THEN 1 ELSE 0 END AS isPromoted',
      )
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .innerJoin('horse.horsetype', 'horsetype', 'horsetype.isEligible=1')
      .innerJoin(
        'stallion.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .leftJoin(
        '(' + scntQuery.getQuery() + ')',
        'scnt',
        'scnt.stallionId=stallion.id',
      )
      .leftJoin(
        '(' + pvQueryBuilder.getQuery() + ')',
        'pvq',
        'pvq.pageViewStallionId=stallion.id',
      )
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      )
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .andWhere('farm.farmUuid = :farmId', { farmId: searchOptionsDto.farmId })
      .andWhere('stallion.isActive = :isActive', { isActive: 1 })
      .andWhere('stallion.isVerified = :isVerified', { isVerified: 1 })
      .setParameters(scntQuery.getParameters())
      .setParameters(pvQueryBuilder.getParameters());
    switch (searchOptionsDto.sortBy) {
      case StallionActivitySort.NAME:
        queryBuilder.addOrderBy('horse.horseName', 'ASC');
        break;
      case StallionActivitySort.SEARCHES:
        queryBuilder.addOrderBy('scnt.searchCount', 'DESC');
        break;
      case StallionActivitySort.PAGEVIEWS:
        queryBuilder.addOrderBy('pvq.pageCount', 'DESC');
        break;
      case StallionActivitySort.TWENTYTWENTYMATCHES:
        queryBuilder.addOrderBy('scnt.ttMatches', 'DESC');
        break;
      case StallionActivitySort.PERFECTMATCHES:
        queryBuilder.addOrderBy('scnt.perfectMatches', 'DESC');
        break;
      default:
        queryBuilder.addOrderBy('horse.horseName', 'ASC');
        break;
    }
    queryBuilder.offset(0).limit(5);
    return queryBuilder.getRawMany();
  }

  /* Get StallionMatchActivity For BreederReport */
  async stallionMatchActivityForBreederReport(
    searchOptionsDto: BreederStallionMatchActivityDto,
  ) {
    const farmResopnse = await getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id as id')
      .andWhere('farm.farmUuid=:farmId', { farmId: searchOptionsDto.farmId })
      .getRawOne();

    if (!farmResopnse) {
      throw new HttpException('farm not found', HttpStatus.NOT_FOUND);
    }
    let fromDate = new Date(); //applicable to today
    let toDate = new Date();
    const curr = new Date(); // get current date

    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'this month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
        toDate = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
      }
      if (filterBy.toLowerCase() === 'this week') {
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        var last = first + 6; // last day is the first day + 6
        fromDate = new Date(curr.setDate(first));
        toDate = new Date(curr.setDate(last));
      }
      if (filterBy.toLowerCase() === 'this year') {
        fromDate = new Date(curr.getFullYear(), 0, 1);
        toDate = new Date(curr.getFullYear(), 11, 31);
      }
      if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
        }
      }
    }

    let result = await this.smRepository.manager.query(
      `EXEC proc_SMPGetStallionMatchActivityForBreeder
      @fromDate=@0,
      @toDate=@1,
      @farmId=@2`,
      [fromDate, toDate, farmResopnse.id],
    );

    await result.map(async (item) => {
      item.location = [];
      if (item.latitude && item.longitude) {
        item.location = [item.latitude, item.longitude];
      }
      delete item.latitude;
      delete item.longitude;
      return item;
    });
    return result;
  }

  /* Download BreederReport */
  async downloadBreederReport(
    searchOptionsDto: BreederStallionMatchActivityDto,
  ) {
    let farm = await this.farmsService.getFarmDetails(searchOptionsDto.farmId);

    let keyStatistics = await this.breederKeyStatistics(searchOptionsDto);
    let matchedMareDto = new SearchMatchedMareDto();
    matchedMareDto.farmId = searchOptionsDto.farmId;
    matchedMareDto.filterBy = searchOptionsDto.filterBy;
    matchedMareDto.fromDate = searchOptionsDto.fromDate;
    matchedMareDto.toDate = searchOptionsDto.toDate;
    let matchedMares = await this.farmsService.findMatchedMares(
      matchedMareDto,
      0,
    );
    await keyStatistics.reduce(async (promise, item) => {
      await promise;
      if (item.CurrentName != '-') {
        item.CurrentName = await this.commonUtilsService.toPascalCase(
          item.CurrentName,
        );
      }
    }, Promise.resolve());
    await matchedMares.reduce(async (promise, item) => {
      await promise;
      item.BreederName = await this.commonUtilsService.toPascalCase(
        item.BreederName,
      );
      item.CountryName = await this.commonUtilsService.toPascalCase(
        item.CountryName,
      );
      item.marename = await this.commonUtilsService.toPascalCase(item.marename);
    }, Promise.resolve());
    let matchActivity = await this.stallionMatchActivityForBreederReport(
      searchOptionsDto,
    );

    // It’s safe to re-create the map at each render, because of the
    // pre-computation it’s super fast
    const map = new DottedMap({ height: 60, grid: 'vertical' });
    if (matchActivity.length > 0) {
      matchActivity.forEach((item) => {
        map.addPin({
          lat: item.location[0],
          lng: item.location[1],
          svgOptions: { color: '#2EFFB4', radius: 0.75 },
        });
      });
    }

    const svgMap = map.getSVG({
      radius: 0.35,
      color: '#D1D5DA',
      shape: 'circle',
      backgroundColor: '#ffff',
    });

    //export default Map;

    let data = {
      farmName: farm?.farmName,
      state: farm?.stateName,
      country: farm?.countryName,
      keyStatistics: keyStatistics,
      matchedMares: matchedMares,
      profileRating: `<span class="linearprogress-bar" style="transform: translateX(${
        farm?.profileRating - 100
      }%);"></span>`,
      profileRatingStatus: await this.getProfileRating(farm?.profileRating),
      mapDataImg: `data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`,
    };
    let contents = readFileSync(
      path.join(process.cwd(), '/src/report-templates/hbs/breeder-report.html'),
      'utf-8',
    );

    let s3ReportLocation = await this.htmlToPdfService.generatePDF(
      contents,
      `${this.configService.get(
        'file.s3DirBreederReportPdf',
      )}/${uuid()}/breeder-report.pdf`,
      data,
      [],
    );
    return [
      {
        downloadUrl: await this.fileUploadsService.generateGetPresignedUrl(
          s3ReportLocation,
        ),
      },
    ];
  }

  /* Get Profile Rating */
  async getProfileRating(profileRating) {
    let ratingStatus = '';
    if (profileRating > 75) {
      ratingStatus = 'Good';
    } else if (profileRating <= 75 && profileRating > 25) {
      ratingStatus = 'Intermediate';
    } else {
      ratingStatus = 'Poor';
    }

    return ratingStatus;
  }

  /* Breeder KeyStatistics */
  async breederKeyStatistics(
    searchOptionsDto: BreederStallionMatchActivityDto,
  ) {
    const farmResopnse = await getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id as id')
      .andWhere('farm.farmUuid=:farmId', { farmId: searchOptionsDto.farmId })
      .getRawOne();

    if (!farmResopnse) {
      throw new HttpException('farm not found', HttpStatus.NOT_FOUND);
    }
    let fromDate = new Date(); //applicable to today
    let toDate = new Date();
    const curr = new Date(); // get current date

    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'this month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
        toDate = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
      }
      if (filterBy.toLowerCase() === 'this week') {
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        var last = first + 6; // last day is the first day + 6
        fromDate = new Date(curr.setDate(first));
        toDate = new Date(curr.setDate(last));
      }
      if (filterBy.toLowerCase() === 'this year') {
        fromDate = new Date(curr.getFullYear(), 0, 1);
        toDate = new Date(curr.getFullYear(), 11, 31);
      }
      if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
        }
      }
    }

    const finalData = await this.smRepository.manager.query(
      `EXEC proc_SMPGetBreederKeyStatisticsByFarm
                   @pFarmId=@0,
                   @pFromDate=@1,
                   @pToDate=@2
                   `,
      [farmResopnse.id, fromDate, toDate],
    );
    let response = [];
    await finalData.map((record: any) => {
      let diffPercent = 0;
      if (record.KPI === 'Breeder Email Rate') {
        if (record.PrevValue) {
          diffPercent = Math.round((record.Diff / record.PrevValue) * 100);
        } else {
          diffPercent = Math.round(record.Diff / 0.01);
        }
      }
      response.push({
        ...record,
        diffPercent: diffPercent,
      });
    });
    return response;
  }

  /* Share SM Search Result - Auth */
  async shareSMSearchResultAuth(data: ShareSMSearchResultAuthDto) {
    const member = this.request.user;
    const fromUserRecord = await getRepository(Member).findOne({ id: member['id'] });
    let mailData = {
      fromName: await this.commonUtilsService.toTitleCase(
        fromUserRecord.fullName,
      ),
      toEmail: data.toEmail,
      toName: await this.commonUtilsService.toTitleCase(
        data.toName,
      ),
      searchPageUrl: data.searchPageUrl
    }
    return await this.shareSMSearchResultToMail(mailData);
  }

  /* Share SM Search Result - Public */
  async shareSMSearchResultPublic(data: ShareSMSearchResultPublicDto) {
    let mailData = {
      fromName: await this.commonUtilsService.toTitleCase(
        data.fromName,
      ),
      toEmail: data.toEmail,
      toName: await this.commonUtilsService.toTitleCase(
        data.toName,
      ),
      searchPageUrl: data.searchPageUrl
    }
    return await this.shareSMSearchResultToMail(mailData);
  }

  /* Share SM Search Result - Email */
  async shareSMSearchResultToMail(inputMailData) {
    let mailData = {
      to: inputMailData.toEmail,
      subject: 'Check Out This Mating!',
      text: '',
      template: '/share-sm-search-result',
      context: {
        fromName: inputMailData.fromName,
        toName: inputMailData.toName,
        searchPageUrl: inputMailData.searchPageUrl,
      },
    };
    this.mailService.sendMailCommon(mailData);
    return 'Success'
  }
}
