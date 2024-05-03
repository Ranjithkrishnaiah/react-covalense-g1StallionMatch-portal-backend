import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { int } from 'aws-sdk/clients/datapipeline';
import { Request } from 'express';
import { readFileSync } from 'fs';
import * as path from 'path';
import { ActivityEntity } from 'src/activity-module/activity.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { Country } from 'src/country/entity/country.entity';
import { CountryService } from 'src/country/service/country.service';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { FarmLocationsService } from 'src/farm-locations/farm-locations.service';
import { FarmsService } from 'src/farms/farms.service';
import { FavouriteFarm } from 'src/favourite-farms/entities/favourite-farm.entity';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { HtmlToPdfService } from 'src/file-uploads/html-to-pdf.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesService } from 'src/horses/horses.service';
import { MailService } from 'src/mail/mail.service';
import { MediaService } from 'src/media/media.service';
import { MemberAddressService } from 'src/member-address/member-address.service';
import { MemberSocialShareService } from 'src/member-social-share/member-social-share.service';
import { Member } from 'src/members/entities/member.entity';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { PageViewService } from 'src/page-view/page-view.service';
import { PreferedNotificationService } from 'src/prefered-notifications/prefered-notifications.service';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/products.service';
import { CreateSmSearchDto } from 'src/search-stallion-match/dto/create-sm-search.dto';
import { SearchStallionMatch } from 'src/search-stallion-match/entities/search-stallion-match.entity';
import { SearchStallionMatchService } from 'src/search-stallion-match/search-stallion-match.service';
import { StallionGalleryImageDto } from 'src/stallion-gallery-images/dto/stallion-gallery-image.dto';
import { StallionGalleryImage } from 'src/stallion-gallery-images/entities/stallion-gallery-image.entity';
import { StallionGalleryImageService } from 'src/stallion-gallery-images/stallion-gallery-image.service';
import { CreateStallionLocationDto } from 'src/stallion-locations/dto/create-stallion-location.dto';
import { UpdateStallionLocationDto } from 'src/stallion-locations/dto/update-stallion-location.dto';
import { StallionLocationsService } from 'src/stallion-locations/stallion-locations.service';
import { StallionProfileImage } from 'src/stallion-profile-image/entities/stallion-profile-image.entity';
import { StallionProfileImageService } from 'src/stallion-profile-image/stallion-profile-image.service';
import { SearchMostMatchedDamSireOptionDto } from 'src/stallion-report/dto/search-most-matched-dam-sire-option.dto';
import { StallionReportSearchOptionDto } from 'src/stallion-report/dto/search-options.dto';
import { CreateStallionServiceFeeDto } from 'src/stallion-service-fees/dto/create-stallion-service-fee.dto';
import { StallionServiceFee } from 'src/stallion-service-fees/entities/stallion-service-fee.entity';
import { StallionServiceFeesService } from 'src/stallion-service-fees/stallion-service-fees.service';
import { StallionTestimonialMediaDto } from 'src/stallion-testimonial-media/dto/stallion-testimonial-media.dto';
import { StallionTestimonialMediaService } from 'src/stallion-testimonial-media/stallion-testimonial-media.service';
import { CreateTestimonialDto } from 'src/stallion-testimonials/dto/create-testimonial.dto';
import { UpdateTestimonialDto } from 'src/stallion-testimonials/dto/update-testimonial.dto';
import { StallionTestimonialsService } from 'src/stallion-testimonials/stallion-testimonials.service';
import { StatesService } from 'src/states/states.service';
import {
  notificationTemplates,
  notificationType,
} from 'src/utils/constants/notifications';
import { PageViewEntityType } from 'src/utils/constants/page-view';
import { PRODUCTCODES, PRODUCTCODESLIST } from 'src/utils/constants/products';
import { StallionStakesProgenySort } from 'src/utils/constants/stallions';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { In, Not, Repository, UpdateResult, getRepository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateStallionDto } from './dto/create-stallion.dto';
import { DamNameSearchDto } from './dto/dam-name-search.dto';
import { DamSireNameSearchDto } from './dto/dam-sire-name-search.dto';
import { deleteStallionDto } from './dto/delete-stallion.dto';
import { FeeRangeSearchDto } from './dto/fee-range-search.dto.';
import { footerSearchDto } from './dto/footer-search.dto';
import { GrandSireNameSearchDto } from './dto/grand-sire-name-search.dto';
import { HypoMatingAdditionalInfoDto } from './dto/hypo-mating-additional-info.dto';
import { MareNameSearchDto } from './dto/mare-name-search.dto';
import { PopularStallionResponseDto } from './dto/popular-stallion-response.dto';
import { PriceMinMaxOptionsDto } from './dto/price-min-max-options.dto';
import { currencyDto } from './dto/report-currency.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { SearchPopularStallionsDto } from './dto/search-popular-stallions.dto';
import { SearchSimilarStallionDto } from './dto/search-similar-stallion.dto';
import { SimilarStallionWithLocationFeeDto } from './dto/similar-stallion-with-location-fee.dto';
import { SireNameSearchDto } from './dto/sire-name-search.dto';
import { StakesProgenyPageOptionsDto } from './dto/stakes-progeny-page-options.dto';
import { StallionInfoResponseDto } from './dto/stallion-info-response.dto';
import { StallionNameSearchDto } from './dto/stallion-name-search.dto';
import { UpdateStallionGalleryDto } from './dto/update-stallion-gallery.dto';
import { UpdateStallionOverviewDto } from './dto/update-stallion-overview.dto';
import { UpdateStallionProfileDto } from './dto/update-stallion-profile.dto';
import { UpdateStallionTestimonialDto } from './dto/update-stallion-testimonial';
import { Stallion } from './entities/stallion.entity';
import { FeeUpdateEnum } from './fee-update.enum';
import { ACTIVITY_TYPE } from 'src/utils/constants/common';

@Injectable({ scope: Scope.REQUEST })
export class StallionsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Stallion)
    private stallionRepository: Repository<Stallion>,
    private stallionLocationService: StallionLocationsService,
    private stallionServiceFeeService: StallionServiceFeesService,
    private horseService: HorsesService,
    private farmService: FarmsService,
    private farmLocationsService: FarmLocationsService,
    private stallionTestimonialsService: StallionTestimonialsService,
    private stallionTestimonialMediaService: StallionTestimonialMediaService,
    private stallionProfileImageService: StallionProfileImageService,
    private stallionGalleryImageService: StallionGalleryImageService,
    private mediaService: MediaService,
    private readonly fileUploadsService: FileUploadsService,
    private commonUtilsService: CommonUtilsService,
    private currenciesService: CurrenciesService,
    private readonly configService: ConfigService,
    private readonly searchSMService: SearchStallionMatchService,
    private readonly pageViewService: PageViewService,
    private readonly membersAddressService: MemberAddressService,
    protected readonly messageTemplatesService: MessageTemplatesService,
    protected readonly mailService: MailService,
    protected readonly preferedNotificationService: PreferedNotificationService,
    private readonly htmlToPdfService: HtmlToPdfService,
    private readonly countryService: CountryService,
    private readonly productService: ProductsService,
    private readonly memberSocialShareService: MemberSocialShareService,
    private notificationsService: NotificationsService,
    private statesService: StatesService,
  ) {}

  /* Get Stallion Min Max Fee Range */
  async getStallionsMinMaxFee(searchOptionsDto: PriceMinMaxOptionsDto) {
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

    const queryBuilder = this.stallionRepository
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
      .innerJoin('stallion.stallionlocation', 'stallionlocation')
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

    let data = await queryBuilder.getRawOne();
    if (!data) {
      return {
        scaleRange: 0,
        minPrice: 0,
        maxPrice: 0,
        minInputPrice: null,
        maxInputPrice: null,
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

  /* Get All Stallions */
  async findAll(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<Stallion>> {
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    if (searchOptionsDto?.currency) {
      let currencyData = await this.currenciesService.findOne(
        searchOptionsDto?.currency,
      );
      if (currencyData) {
        destinationCurrencyCode = currencyData.currencyCode;
      }
    }

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

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select(
        'stallion.stallionUuid as stallionId, profileMediaUrl as profilePic, sgiMedia.mediaUrl as galleryImage, stallion.url, stallion.yearToStud, stallion.yearToRetired, stallion.overview',
      )
      .addSelect('horse.horseName, horse.yob')
      .addSelect('colour.colourDominancy as colourName')
      .addSelect('farm.farmName as farmName')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'stallionservicefee.fee as fee,  (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) AS convFee',
      )
      .addSelect(
        'stallionservicefee.feeYear as feeYear, stallionservicefee.isPrivateFee as isPrivateFee',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect(
        'promotion.startDate as startDate, promotion.endDate as expiryDate, promotion.id as stallionPromotionId, CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted, promotion.isAutoRenew',
      )
      .addSelect(
        'nomination.noOfNominations as nominationPendingCount, nomination.startDate as nominationStartDate, nomination.endDate as nominationEndDate, CASE WHEN getutcdate() BETWEEN nomination.startDate AND nomination.endDate THEN 1 ELSE 0 END AS isNominated',
      )
      .addSelect(
        'sire.sireId, sire.sireName, sire.sireYob, sire.sireCountryCode',
      )
      .addSelect('dam.damId, dam.damName, dam.damYob, dam.damCountryCode')
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
      .leftJoin('stallion.stallionnomination', 'nomination')
      .leftJoin('stallion.stallionpromotion', 'promotion')
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
          'sireTwo',
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
        await this.horseService.getAllAncestorHorsesByHorseId(
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

    queryBuilder
      .andWhere('stallion.isActive=:isActive', { isActive: 1 })
      .andWhere('stallion.isVerified=:isVerified', { isVerified: 1 });

    if (searchOptionsDto.farms) {
      let farms = searchOptionsDto.farms.split(',');
      queryBuilder.andWhere('farm.farmUuid  IN (:...farms)', { farms: farms });
    }

    if (searchOptionsDto.stallionName) {
      if (searchOptionsDto.isStallionNameExactSearch) {
        queryBuilder.andWhere('horse.horseName = :stallionName', {
          stallionName: searchOptionsDto.stallionName,
        });
      } else {
        queryBuilder.andWhere('horse.horseName like :stallionName', {
          stallionName: `%${searchOptionsDto.stallionName}%`,
        });
      }
    }
    if (searchOptionsDto.farmName) {
      queryBuilder.andWhere('farm.farmName like :farmName', {
        farmName: `%${searchOptionsDto.farmName}%`,
      });
    }
    if (searchOptionsDto.stallionId) {
      queryBuilder.andWhere('horse.horseUuid = :stallionId', {
        stallionId: searchOptionsDto.stallionId,
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
      let yearToStud = searchOptionsDto.yearToStud.split(',');
      let yearToStudList = yearToStud.map((res) => parseInt(res));
      queryBuilder.andWhere('stallion.yearToStud  IN (:...yearToStud)', {
        yearToStud: yearToStudList,
      });
    }
    if (searchOptionsDto.colour) {
      let colour = searchOptionsDto.colour.split(',');
      let colourList = colour.map((res) => parseInt(res));
      queryBuilder.andWhere('colour.colourDominancyId IN (:...colour)', {
        colour: colourList,
      });
    }

    if (searchOptionsDto.promoted) {
      queryBuilder.andWhere(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END = :isPromoted',
        { isPromoted: searchOptionsDto.promoted },
      );
    }

    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      switch (sortBy.toLowerCase()) {
        case 'promoted':
          queryBuilder
            .addOrderBy(
              'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END',
              'DESC',
            )
            .addOrderBy('horse.horseName', 'ASC');
          break;
        case 'stud fee':
          queryBuilder.addOrderBy(
            'CASE WHEN stallionservicefee.isPrivateFee=0 THEN 1 ELSE 0 END',
            'DESC',
          );
          queryBuilder.addOrderBy(
            '(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate))',
            'DESC',
          );
          break;
        case 'recently updated':
          queryBuilder.addOrderBy('stallion.modifiedOn', 'DESC');
          break;
        case 'available nominations':
          queryBuilder
            .addOrderBy(
              'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END',
              'DESC',
            )
            .addOrderBy(
              'CASE WHEN getutcdate() BETWEEN nomination.startDate AND nomination.endDate THEN 1 ELSE 0 END',
              'DESC',
            )
            .addOrderBy('nomination.noOfNominations', 'DESC')
            .addOrderBy('horse.horseName', 'ASC');
          break;
        case 'alphabetical':
          queryBuilder.addOrderBy('horse.horseName', 'ASC');
          break;
        default:
          queryBuilder.addOrderBy('horse.horseName', 'ASC');
      }
    }
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
          if (maxPrice === '10000000') {
            queryBuilder.andWhere(
              '(((stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1)',
              {
                minPrice,
              },
            );
          } else {
            queryBuilder.andWhere(
              '(((stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) <= :maxPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1)',
              {
                minPrice,
                maxPrice,
              },
            );
          }
        } else {
          if (maxPrice === '10000000') {
            queryBuilder.andWhere(
              '(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND stallionservicefee.isPrivateFee=0',
              {
                minPrice,
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
      }
    } else {
      if (!searchOptionsDto.isPrivateFee) {
        queryBuilder.andWhere(
          'stallionservicefee.isPrivateFee = :isPrivateFee',
          {
            isPrivateFee: 0,
          },
        );
      }
    }

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
      searchOptionsDto.keyAncestorId ||
      !searchOptionsDto.isExcludeKeyAncestor ||
      !searchOptionsDto.isPrivateFee
    ) {
      min = Math.round(
        Math.min(
          ...entitiesWithoutLimit.map((item) =>
            item.isPrivateFee ? 0 : item.convFee,
          ),
        ),
      );
      max = Math.round(
        Math.max(
          ...entitiesWithoutLimit.map((item) =>
            item.isPrivateFee ? 0 : item.convFee,
          ),
        ),
      );
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

  /* Get Complete Stallion Information By stallionId - UnAuthorized User */
  async getCompleteStallionInfo(
    stallionUuid: string,
  ): Promise<StallionInfoResponseDto> {
    const record = await this.getStallionByUuid(stallionUuid);
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

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select(
        'stallion.stallionUuid as stallionId, profileMediaUrl as profilePic, stallion.url, stallion.height, stallion.yearToStud, stallion.yearToRetired, colour.id as colourId, colour.colourDominancy as colourName, stallion.overview, sgiMedia.mediaUrl as galleryImage',
      )
      .addSelect('horse.horseName, horse.yob, horse.dob')
      .addSelect('farm.farmUuid as farmId, farm.farmName')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'stallionservicefee.feeYear as feeYear, stallionservicefee.currencyId as currencyId, stallionservicefee.fee as fee, stallionservicefee.isPrivateFee as isPrivateFee',
      )
      .addSelect(
        'country.id as countryId, country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect('sire.sireName, sire.sireYob, sire.sireCountryCode')
      .addSelect('dam.damName, dam.damYob, dam.damCountryCode')
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .addSelect(
        'CASE WHEN getutcdate() BETWEEN nomination.startDate AND nomination.endDate THEN 1 ELSE 0 END AS isNominated',
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
      .leftJoin('stallionservicefee.currency', 'currency')
      .innerJoin('stallionlocation.country', 'country')
      .leftJoin('stallionlocation.state', 'state')
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
      .leftJoin('stallion.stallionnomination', 'nomination')
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=promotion.id',
      )
      .andWhere('stallion.id = :id', { id: record.id })
      .andWhere('stallion.isVerified = :isVerified', { isVerified: 1 })
      .andWhere('stallion.isActive = :isActive', { isActive: 1 })
      .orderBy('stallionservicefee.id', 'DESC');

    let stallionRecord = await queryBuilder.getRawOne();
    let raceWins = await this.stallionRepository.manager.query(
      `EXEC procGetHorseStakeRaceWinsList 
                     @horseId=@0`,
      [record.horseId],
    );
    return {
      ...stallionRecord,
      wins: raceWins,
    };
  }

  /* Get Stallion Overview By Stallion */
  async getStallionDynamicOverview(stallion) {
    const result = await this.stallionRepository.manager.query(
      `EXEC proc_SMPStallionPageDynamicOveriew
      @pStallionid=@0`,
      [stallion.id],
    );

    let dynamicOverview;
    if (result.length) {
      dynamicOverview = result[0];
      const finalData = {
        bestProgeny1Name: await this.formateOverviewText(
          dynamicOverview['BestProgeny#1Name'],
        ),
        bestProgeny2Name: await this.formateOverviewText(
          dynamicOverview['BestProgeny#2Name'],
        ),
        bestProgeny3Name: await this.formateOverviewText(
          dynamicOverview['BestProgeny#3Name'],
        ),
        bestStakeRaceName: dynamicOverview['BestStakeRaceName'],
        bestStakeRaceYearWon: dynamicOverview['BestStakeRaceYearWon'],
        broodmareSire1: await this.formateOverviewText(
          dynamicOverview['BroodmareSire#1'],
        ),
        broodmareSire2: await this.formateOverviewText(
          dynamicOverview['BroodmareSire#2'],
        ),
        broodmareSire3: await this.formateOverviewText(
          dynamicOverview['BroodmareSire#3'],
        ),
        broodmareSire4: await this.formateOverviewText(
          dynamicOverview['BroodmareSire#4'],
        ),
        longestDistance: dynamicOverview['LongestDistance'],
        progenyAgeAtWin: dynamicOverview['ProgenyAgeAtWin'],
        sireStatus: dynamicOverview['SireStatus'],
        smallestDistance: dynamicOverview['SmallestDistance'],
        stallionAGE: dynamicOverview['StallionAGE'],
        stallionColour: dynamicOverview['stallionColour'],
        stallionCountryName: await this.commonUtilsService.toTitleCase(
          dynamicOverview['StallionCountryName'],
        ),
        stallionDamCOB: dynamicOverview['StallionDamCOB'],
        stallionDamName: await this.commonUtilsService.toTitleCase(
          dynamicOverview['StallionDamName'],
        ),
        stallionSireName: await this.commonUtilsService.toTitleCase(
          dynamicOverview['StallionSireName'],
        ),
        stallionhorseid: dynamicOverview['Stallionhorseid'],
        farmName: await this.commonUtilsService.toTitleCase(
          dynamicOverview['farmName'],
        ),
        stallionName: await this.commonUtilsService.toTitleCase(
          dynamicOverview['stallionName'],
        ),
        stallionid: dynamicOverview['stallionid'],
      };
      return finalData;
    }
    return null;
  }

  /* Get Format Stallion Overview Data */
  async formateOverviewText(str: string) {
    if (str) {
      let strArr = str.split(', ');
      if (strArr.length === 3) {
        return (
          (await this.commonUtilsService.toTitleCase(strArr[0])) +
          ' (' +
          strArr[1] +
          ', ' +
          strArr[2] +
          ')'
        );
      }
      return '';
    }
    return '';
  }

  /* Get Complete Stallion Information By stallionId - Authorized */
  async findStallionInfo(stallionUuid: string) {
    const record = await this.getStallionByUuid(stallionUuid);
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

    let cartProductQueryBuilder = getRepository(Cart)
      .createQueryBuilder('cart')
      .select(
        'cart.id as id,cart.cartSessionId as cartSessionId,cartProductItem.stallionPromotionId as stallionPromotionId,cartProductItem.stallionId as stallionIds',
      )
      .innerJoin(
        'cart.cartProduct',
        'cartProduct',
        'cartProduct.cartId=cart.id',
      )
      .innerJoin(
        'cartProduct.product',
        'product',
        'product.id=cartProduct.productId',
      )
      .innerJoin(
        'cartProduct.cartProductItem',
        'cartProductItem',
        'cartProductItem.cartProductId=cartProduct.id',
      )
      .andWhere("product.productCode = 'PROMOTION_STALLION'")
      .andWhere('cartProductItem.stallionPromotionId IS NOT NULL');

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select(
        'stallion.stallionUuid as stallionId, mediaUrl as profilePic, stallion.url, stallion.height, stallion.yearToStud, stallion.yearToRetired, colour.id as colourId, colour.colourDominancy as colourName, stallion.overview, 0 as profileRating',
      )
      .addSelect('horse.horseName, horse.yob, horse.dob')
      .addSelect('farm.farmUuid as farmId, farm.farmName')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'stallionservicefee.feeYear as feeYear, stallionservicefee.currencyId as currencyId, stallionservicefee.fee as fee, stallionservicefee.isPrivateFee as isPrivateFee',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect('sire.sireName, sire.sireYob, sire.sireCountryCode')
      .addSelect('dam.damName, dam.damYob, dam.damCountryCode')
      .addSelect(
        'promotion.startDate, promotion.endDate as expiryDate, promotion.id as stallionPromotionId,promotion.promotedCount as promotedCount, CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted, promotion.isAutoRenew as isAutoRenew, promotion.stopPromotionCount as stopPromotionCount, promotion.expiryDate as lockedExpiryDate',
      )
      .addSelect('cart.cartSessionId as cartId')
      .addSelect(
        'nomination.noOfNominations as nominationPendingCount, nomination.startDate as nominationStartDate, nomination.endDate as nominationEndDate, CASE WHEN getutcdate() BETWEEN nomination.startDate AND nomination.endDate THEN 1 ELSE 0 END AS isNominated',
      )
      .addSelect(
        'stalliontestimonials.title as testimonialTitle,stalliontestimonials.company as testimonialTCompany,stalliontestimonials.description as testimonialTDescription',
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
      .leftJoin('stallionservicefee.currency', 'currency')
      .innerJoin('stallionlocation.country', 'country')
      .leftJoin('stallionlocation.state', 'state')
      .leftJoin('stallion.stalliontestimonials', 'stalliontestimonials')
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
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .leftJoin('stallion.stallionnomination', 'nomination')
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      )
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=promotion.id',
      )
      .leftJoin(
        '(' + cartProductQueryBuilder.getQuery() + ')',
        'cart',
        'stallionPromotionId=promotion.id',
      )
      .andWhere('stallion.id = :id', { id: record.id })
      .andWhere('stallion.isVerified = :isVerified', { isVerified: 1 })
      .andWhere('stallion.isActive = :isActive', { isActive: 1 })
      .orderBy('stallionservicefee.id', 'DESC');

    const entity = await queryBuilder.getRawOne();
    if (!entity) {
      throw new UnprocessableEntityException('Stallion not exist!');
    }
    return this.addProfileRating(entity);
  }

  /* Get Profile Rating for a stallion */
  async addProfileRating(stallion) {
    const sgImages = await this.getAllStallionGalleryImages(
      stallion.stallionId,
    );
    stallion.profileRating = this.calculateRatingPercentage(stallion, sgImages);
    this.deleteExtraFiels(stallion);
    return stallion;
  }

  /* Calculate Profile Rating percentage for a stallion */
  calculateRatingPercentage(stallion, gImages) {
    const totalRequiredFields = Number(process.env.TOTAL_REQUIRED_FIELDS);
    const completePercentage = Number(process.env.COMPLETE_PERCENTAGE);
    const {
      profilePic,
      horseName,
      farmName,
      yob,
      colourName,
      fee,
      feeYear,
      countryCode,
      yearToStud,
      height,
      overview,
      testimonialTitle,
      testimonialTCompany,
      testimonialTDescription,
    } = stallion;
    const stallionData = {
      profilePic,
      horseName,
      farmName,
      yob,
      colourName,
      fee,
      feeYear,
      countryCode,
      yearToStud,
      height,
      overview,
    };
    const testimonialData = {
      testimonialTitle,
      testimonialTCompany,
      testimonialTDescription,
    };
    let completedCount = 0;
    let profileRating = 0;
    for (let value of Object.values(stallionData)) {
      if (value) completedCount++;
    }
    completedCount = completedCount + this.checkTestimonial(testimonialData);
    if (gImages && gImages.length >= 8) {
      completedCount++;
    }
    if (completedCount) {
      profileRating = Number(
        ((completedCount / totalRequiredFields) * completePercentage).toFixed(
          2,
        ),
      );
    }
    return profileRating;
  }

  /* Check Stallion Testimonial Limit */
  checkTestimonial(testimonial) {
    let count = 0;
    for (let value of Object.values(testimonial)) {
      if (value) count++;
    }
    return count == 3 ? 1 : 0;
  }

  /* Delete Extra Fields while adding profile rating to stallion */
  deleteExtraFiels(data) {
    delete data['testimonialTitle'];
    delete data['testimonialTCompany'];
    delete data['testimonialTDescription'];
  }

  /* Get Stallion by stallionUuid */
  async findOne(stallionUuid: string) {
    let record = await this.getStallionByUuid(stallionUuid);
    return record;
  }

  /* Get Stallion */
  async findStallion(fields) {
    let record = await this.stallionRepository.findOne({ where: fields });
    return record;
  }

  /* Get Stallion by PrimaryKey */
  async findStallionById(stallionId) {
    const record = await this.stallionRepository.findOne({
      id: stallionId,
    });
    if (!record) {
      throw new UnprocessableEntityException('Stallion not exist!');
    }
    return record;
  }

  /* Get Stallion by Country */
  async findStallionsByCountryId(countryId: int) {
    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select('stallion.stallionUuid as stallionId')
      .addSelect('horse.horseName')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .innerJoin('stallionlocation.country', 'country');
    queryBuilder.andWhere('stallionlocation.countryId = :country', {
      country: countryId,
    });
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /* Update Stallion by stallionUuid */
  async profileUpdate(stallionUuid: string, data: UpdateStallionProfileDto) {
    const member = this.request.user;
    let record = await this.getStallionByUuid(stallionUuid);
    const { farmId } = data;
    let farm = await this.farmService.findOne({ farmUuid: farmId });
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }
    //Check Horse Already Attached with same farm, other than same stallion record
    const stallionDuplicationCheck =
      await this.getStallionByStallionIdHorseIdAndFarmId(
        record.id,
        record.horseId,
        farm.id,
      );
    if (stallionDuplicationCheck) {
      throw new ConflictException('Stallion with the farm already exist!');
    }

    //Set ProfilePic
    if (data?.profileImageuuid) {
      await this.setStallionProfilePic(record, data.profileImageuuid);
    }
    // Check Farm, If Farm Changed!
    if (record.farmId !== farm.id) {
      let farmLocation = await this.farmLocationsService.findByFarmId(farm.id);
      let locationData = new UpdateStallionLocationDto();
      // Capture farmLocation Details
      locationData.countryId = farmLocation.countryId;
      locationData.stateId = farmLocation.stateId;

      locationData.stallionId = record.id;
      locationData.modifiedBy = member['id'];
      await this.stallionLocationService.update(record.id, locationData);
    }

    let feeData = new CreateStallionServiceFeeDto();
    feeData.currencyId = data.currencyId;
    feeData.feeYear = data.feeYear;
    feeData.fee = data.fee;
    feeData.isPrivateFee = data.isPrivateFee;
    feeData.feeUpdatedFrom = FeeUpdateEnum.FarmUpdate; //Farm Update

    const updateDto = {
      ...data,
      farmId: farm.id,
    };

    delete updateDto.currencyId;
    delete updateDto.fee;
    delete updateDto.feeYear;
    delete updateDto.feeUpdatedFrom;
    delete updateDto.isPrivateFee;
    delete updateDto.profileImageuuid;
    updateDto.modifiedBy = member['id'];

    await this.stallionRepository.update(
      { stallionUuid: stallionUuid },
      updateDto,
    );
    const stallionResponse = await this.stallionRepository.findOne({
      stallionUuid: stallionUuid,
    });
    feeData.stallionId = stallionResponse.id;
    feeData.createdBy = member['id'];
    await this.stallionServiceFeeService.create(feeData);

    const response = await this.getCompleteStallionInfo(stallionUuid);
    this.sendMailForUpdateStallion(member, response, farm);
    return response;
  }

  /* Update Stallion Overview by stallionUuid */
  async overviewUpdate(stallionUuid: string, data: UpdateStallionOverviewDto) {
    const member = this.request.user;
    await this.getStallionByUuid(stallionUuid);
    let updateDto = {
      ...data,
      modifiedBy: member['id'],
    };

    await this.stallionRepository.update(
      { stallionUuid: stallionUuid },
      updateDto,
    );
    const response = await this.getCompleteStallionInfo(stallionUuid);
    let farm = await this.farmService.findOne({ farmUuid: response.farmId });
    this.sendMailForUpdateStallion(member, response, farm);
    return response;
  }

  /* Update Stallion Gallery Image by stallionUuid */
  async galleryUpdate(stallionUuid: string, data: UpdateStallionGalleryDto) {
    const record = await this.getStallionByUuid(stallionUuid);
    const member = this.request.user;
    //Validate and Set GalleryImage
    if (data?.galleryImages) {
      await this.setGalleryImages(record.id, data.galleryImages);
    }
    const response = await this.getCompleteStallionInfo(stallionUuid);
    let farm = await this.farmService.findOne({ farmUuid: response.farmId });
    this.sendMailForUpdateStallion(member, response, farm);
    return response;
  }

  /* Update Stallion Testimonial by stallionUuid */
  async testimonialUpdate(
    stallionUuid: string,
    data: UpdateStallionTestimonialDto,
  ) {
    const record = await this.getStallionByUuid(stallionUuid);
    const member = this.request.user;
    //Validate and Set GalleryImage
    if (data?.testimonials) {
      await this.setTestimonials(record.id, data.testimonials);
    }
    //    return await this.getCompleteStallionInfo(stallionUuid);
    const response = await this.getCompleteStallionInfo(stallionUuid);
    let farm = await this.farmService.findOne({ farmUuid: response.farmId });
    this.sendMailForUpdateStallion(member, response, farm);
    return response;
  }

  /* Set Stallion Profile Pic */
  async setStallionProfilePic(record: Stallion, fileUuid: string) {
    // Check Profile pic already exist, if yes delete it from S3
    let profileImageData =
      await this.stallionProfileImageService.findByStallionId(record.id);
    if (profileImageData) {
      //Mark for Deletion - previous profile image
      await this.mediaService.markForDeletion(profileImageData.mediaId);
    }
    // Set Stallion Profile Image
    let mediaRecord = await this.mediaService.create(fileUuid);
    await this.stallionProfileImageService.create({
      stallionId: record.id,
      mediaId: mediaRecord.id,
    });
  }

  /* Set Stallion Gallery Images */
  async setGalleryImages(
    stallionId: number,
    galleryImages: StallionGalleryImageDto[],
  ) {
    let newImages = [];
    let deletedImages = [];
    await galleryImages.reduce(
      async (promise, galleryImage: StallionGalleryImageDto) => {
        await promise;
        if (galleryImage.mediauuid) {
          if (galleryImage.isDeleted) {
            deletedImages.push(galleryImage.mediauuid);
          } else {
            newImages.push(galleryImage.mediauuid);
          }
        }
      },
      Promise.resolve(),
    );
    // Validate Count
    let itemCount =
      await this.stallionGalleryImageService.getImagesCountByStallionId(
        stallionId,
      );
    itemCount = itemCount + newImages.length - deletedImages.length;
    if (itemCount > this.configService.get('file.maxLimitGalleryImage')) {
      throw new UnprocessableEntityException('Max limit reached!');
    }
    let stallionGalleryImageService = this.stallionGalleryImageService;
    await galleryImages.reduce(
      async (promise, galleryImage: StallionGalleryImageDto) => {
        await promise;
        if (galleryImage.mediauuid) {
          if (galleryImage.isDeleted) {
            await this.mediaService.markForDeletionByMediaUuid(
              galleryImage.mediauuid,
            );
          } else {
            let mediaRecord = await this.mediaService.create(
              galleryImage.mediauuid,
            );
            await stallionGalleryImageService.create(
              stallionId,
              mediaRecord.id,
              galleryImage.position,
            );
          }
        }
      },
      Promise.resolve(),
    );
  }

  /* Set Stallion Testimonials */
  async setTestimonials(
    stallionId: number,
    testimonials: CreateTestimonialDto[],
  ) {
    let createdTestimonials = [];
    let updatedTestimonials = [];
    let deletedTestimonials = [];
    await testimonials.reduce(
      async (promise, testimonial: CreateTestimonialDto) => {
        await promise;
        if (testimonial.testimonialId) {
          if (testimonial.isDeleted) {
            //Delete Testimonial
            deletedTestimonials.push(testimonial);
          } else {
            //Update Testimonial
            updatedTestimonials.push(testimonial);
          }
        } else {
          //Create Testimonial
          createdTestimonials.push(testimonial);
        }
      },
      Promise.resolve(),
    );

    // Validate Count is Under this.configService.get('file.maxLimitStallionTestimonial')
    let testimonialCount =
      await this.stallionTestimonialsService.getTestimonialCount(stallionId);
    testimonialCount =
      testimonialCount +
      createdTestimonials.length -
      deletedTestimonials.length;
    if (
      testimonialCount >
      this.configService.get('file.maxLimitStallionTestimonial')
    ) {
      throw new UnprocessableEntityException('Testimonials Limit reached!');
    }

    //Delete Testimonials
    await this.deleteTestimonialsFromStallion(stallionId, deletedTestimonials);
    //Update Testimonials
    await this.updateTestimonialsToStallion(stallionId, updatedTestimonials);
    //Add New Testimonials
    await this.addNewTestimonialsToStallion(stallionId, createdTestimonials);
  }

  /* Add New Stallion Testimonial */
  async addNewTestimonialsToStallion(
    stallionId: number,
    createdTestimonials: CreateTestimonialDto[],
  ) {
    await createdTestimonials.reduce(
      async (promise, testimonial: CreateTestimonialDto) => {
        await promise;
        let createTestimonialDto = new CreateTestimonialDto();
        createTestimonialDto.title = testimonial.title;
        createTestimonialDto.company = testimonial.company;
        createTestimonialDto.description = testimonial.description;
        let testimonialRecord = await this.stallionTestimonialsService.create(
          stallionId,
          createTestimonialDto,
        );
        await testimonial?.testimonialMedia.reduce(
          async (promise, media: StallionTestimonialMediaDto) => {
            await promise;
            if (!media.isDeleted) {
              if (media?.mediauuid) {
                // Create Mediafile
                let mediaRecord = await this.mediaService.create(
                  media.mediauuid,
                );
                await this.stallionTestimonialMediaService.create(
                  testimonialRecord.id,
                  mediaRecord.id,
                );
              }
            }
          },
          Promise.resolve(),
        );
      },
      Promise.resolve(),
    );
  }

  /* Update Stallion Testimonial */
  async updateTestimonialsToStallion(
    stallionId: number,
    updatedTestimonials: CreateTestimonialDto[],
  ) {
    await updatedTestimonials.reduce(
      async (promise, testimonial: CreateTestimonialDto) => {
        await promise;
        await testimonial?.testimonialMedia.reduce(
          async (promise, media: StallionTestimonialMediaDto) => {
            await promise;
            if (media?.mediauuid) {
              if (media.isDeleted) {
                await this.mediaService.markForDeletionByMediaUuid(
                  media.mediauuid,
                );
              } else {
                // Add Media file
                let mediaRecord = await this.mediaService.create(
                  media.mediauuid,
                );
                await this.stallionTestimonialMediaService.create(
                  testimonial.testimonialId,
                  mediaRecord.id,
                );
              }
            }
          },
          Promise.resolve(),
        );
        let updateTestimonialDto = new UpdateTestimonialDto();
        updateTestimonialDto.title = testimonial.title;
        updateTestimonialDto.company = testimonial.company;
        updateTestimonialDto.description = testimonial.description;
        await this.stallionTestimonialsService.update(
          stallionId,
          testimonial.testimonialId,
          updateTestimonialDto,
        );
      },
      Promise.resolve(),
    );
  }

  /* Delete Stallion Testimonial */
  async deleteTestimonialsFromStallion(
    stallionId: number,
    deletedTestimonials: CreateTestimonialDto[],
  ) {
    await deletedTestimonials.reduce(
      async (promise, testimonial: CreateTestimonialDto) => {
        await promise;
        await testimonial?.testimonialMedia.reduce(
          async (promise, media: StallionTestimonialMediaDto) => {
            await promise;
            if (media?.mediauuid && media.isDeleted) {
              await this.mediaService.markForDeletionByMediaUuid(
                media.mediauuid,
              );
            }
          },
          Promise.resolve(),
        );
        await this.stallionTestimonialsService.delete(
          stallionId,
          testimonial.testimonialId,
        );
      },
      Promise.resolve(),
    );
  }

  /* Update Stallion By stallionId */
  async updateStallion(stallionId: number, data) {
    return this.stallionRepository.update({ id: stallionId }, data);
  }

  /* Remove Stallion */
  async remove(deleteStallionDto: deleteStallionDto) {
    let stallionRecord = await this.getStallionByUuid(
      deleteStallionDto.stallionId,
    );
    const member = this.request.user;
    const response:UpdateResult = await this.stallionRepository.update(
      { id: stallionRecord.id },
      {
        isActive: false,
        modifiedBy: member['id'],
        isRemoved: true,
        modifiedOn: new Date(),
      },
    );
    if(response.affected >0)
    return {
      statusCode: 200,
      message: `This action removes a #${deleteStallionDto.stallionId} stallion`,
      data: response,
    }
    else
    return {
        statusCode: HttpStatus.NOT_MODIFIED,
        message: 'Not Deleted',
      };
  }

  /* Get Stallion By stallionId */
  async getStallionByUuid(stallionUuid: string) {
    const record = await this.stallionRepository.findOne({
      stallionUuid,
      isActive: true,
      isRemoved: false,
    });
    if (!record) {
      throw new UnprocessableEntityException('Stallion not exist!');
    }
    return record;
  }

  /* Get All Promotion Status List */
  async getPromotionsStatusList() {
    return this.commonUtilsService.getAllPromotionsStatus();
  }

  /* Get All Fee Status List */
  async getFeeStatusList() {
    return this.commonUtilsService.getAllFeeStatus();
  }

  /* Get Presigned Url for Uploading a Profile Image to a Stallion */
  async profileImageUpload(stallionUuid: string, fileInfo: FileUploadUrlDto) {
    let record = await this.getStallionByUuid(stallionUuid);
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    //TODO: Validate allowed file format or not
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyImages(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );
    const fileKey = `${this.configService.get(
      'file.s3DirStallionProfileImage',
    )}/${record.stallionUuid}/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  /* Get Presigned Url for Uploading a Gallery Image to a Stallion */
  async galleryImageUpload(stallionUuid: string, fileInfo: FileUploadUrlDto) {
    let record = await this.getStallionByUuid(stallionUuid);
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    //TODO: Validate allowed file format or not
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyImages(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );
    const fileKey = `${this.configService.get(
      'file.s3DirStallionGalleryImage',
    )}/${record.stallionUuid}/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  /* Get Presigned Url for Uploading a Testimonial Image to a Stallion */
  async testimonialsMediaUpload(
    stallionUuid: string,
    fileInfo: FileUploadUrlDto,
  ) {
    const record = await this.getStallionByUuid(stallionUuid);
    await this.mediaService.validateFileUuid(fileInfo.fileuuid);
    //TODO: Validate allowed file format or not
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      fileInfo.fileName,
    );
    await this.fileUploadsService.allowOnlyVideosAndImages(fileMimeType);
    await this.fileUploadsService.validateFileSize(
      fileMimeType,
      fileInfo.fileSize,
    );
    const fileKey = `${this.configService.get(
      'file.s3DirStallionTestimonialImage',
    )}/${record.stallionUuid}/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }

  /* Get All Stallion Gallery Images By stallionId */
  async getAllStallionGalleryImages(stallionUuid: string) {
    const stallion = await this.getStallionByUuid(stallionUuid);
    return await this.stallionGalleryImageService.getAllStallionGalleryImages(
      stallion.id,
    );
  }

  /* Get All Stallion Testimonials By stallionId */
  async getAllTestimonialsByStallionId(stallionUuid: string) {
    const stallion = await this.getStallionByUuid(stallionUuid);
    let records =
      await this.stallionTestimonialsService.getAllTestimonialsByStallionId(
        stallion.id,
      );
    return records;
  }

  /* Get All Year to stud list */
  async getYearToStudList() {
    const currentYear = new Date().getFullYear();
    let list = await this.commonUtilsService.getYearsList(
      currentYear,
      2000,
      -1,
    );
    let result = [];
    list.map(function (element) {
      result.push({
        id: element,
        value: element,
      });
    });
    return result;
  }

  /* Get All Year to retired list */
  async getYearToRetiredList() {
    const currentYear = new Date().getFullYear();
    let list = await this.commonUtilsService.getYearsList(
      currentYear,
      2000,
      -1,
    );
    let result = [];
    list.map(function (element) {
      result.push({
        id: element,
        value: element,
      });
    });
    return result;
  }

  /* Get Stallion Peigree Data */
  async getStallionPedigreeByIdAndViewType(
    stallionUuid: string,
    viewType: string,
    generation = 5,
  ) {
    const record = await this.getStallionByUuid(stallionUuid);
    const horseRecord = await this.horseService.findHorseById(record.horseId);
    const horseCountry = await this.countryService.findByCountryId(
      horseRecord.countryId,
    );
    let results = await this.stallionRepository.manager.query(
      `EXEC proc_SMPPerfectMatch @SireID=@0, @DamID=@1, @level=@2`,
      [horseRecord.sireId, horseRecord.damId, generation],
    );

    await results.map(function getItem(item) {
      if (item.generation === 1 && item.childId == null) {
        item.childId = horseRecord.id;
        item.progenyId = horseRecord.horseUuid;
        delete item.MatchResult;
        delete item.HypoMating;
        delete item.HypoMating;
      }
      return item;
    });

    let horseTag = await this.stallionRepository.manager.query(
      `EXEC proc_HorseInfoInPedigree @phorseId=@0`,
      [horseRecord.id],
    );

    let horseInfoTag = null;
    let horseCountryCode = null;
    if (horseCountry) {
      horseCountryCode = horseCountry.countryCode;
    }
    let horseInfoInFullTag = null;
    if (horseTag.length) {
      horseInfoTag = horseTag[0].FirstTag;
      horseInfoInFullTag = horseTag[0].FirstTaginFull;
    }

    //RaceHorse Flags
    let isRaceHorse = 0;
    let raceHorseUrl = null;
    let raceHorse = await this.stallionRepository.manager.query(
      `EXEC procGetRaceHorseByHorseId @horseId=@0`,
      [horseRecord.horseUuid],
    );
    if (raceHorse.length) {
      raceHorseUrl = raceHorse[0].raceHorseUrl;
      isRaceHorse = 1;
    }

    let mainHorse = {
      ColorCoding: null,
      id: horseRecord.id,
      horseName: horseRecord.horseName,
      generation: 0,
      tag: 'S',
      hp: 'S',
      sireId: horseRecord.sireId,
      damId: horseRecord.damId,
      childId: null,
      sex: horseRecord.sex,
      yob: horseRecord.yob,
      horseId: horseRecord.horseUuid,
      countryId: horseRecord.countryId,
      colourId: horseRecord.colourId,
      gelding: horseRecord.gelding,
      isLocked: horseRecord.isLocked,
      isVerified: horseRecord.isVerified,
      horseTypeId: horseRecord.horseTypeId,
      cob: horseCountryCode,
      progenyId: null,
      FirstInfo: horseInfoTag,
      FirstInfoinFull: horseInfoInFullTag,
      isRaceHorse,
      raceHorseUrl,
    };

    let finalResults = [];
    finalResults.push(mainHorse);
    await results.map(function getItem(item) {
      finalResults.push(item);
    });

    if (viewType === 'tree') {
      let data = await this.horseService.treePedigreeByHorseId(
        record,
        finalResults,
      );
      if (data) {
        let farmData = await this.farmService.getFarmLogoByFarmId(
          record.farmId,
        );
        let stallionFarms = await this.getStallionFarms(stallionUuid);
        let stallionProfileImageData =
          await this.getStallionProfilePicsByStallionId(record.id);
        return {
          farmLogo: farmData.farmLogo,
          farmName: farmData.farmName,
          farmsCount: stallionFarms.length,
          stallionProfileImageData: stallionProfileImageData,
          ...data,
        };
      }
    } else {
      return finalResults;
    }
  }

  /* Get Stallion */
  async getStallionByStallionIdHorseIdAndFarmId(
    stallionId: number,
    horseId: number,
    farmId: number,
  ) {
    const record = await this.stallionRepository.findOne({
      where: {
        id: Not(stallionId),
        horseId: horseId,
        farmId: farmId,
        isRemoved: false,
      },
    });
    return record;
  }

  /* Get Stallion Sire Names Data */
  async findSiresByName(searchOptions: SireNameSearchDto) {
    return await this.stallionRepository.manager.query(
      `EXEC proc_SMPGetStallionSireName 
                     @SireName=@0,
                     @SortOrder=@1`,
      [searchOptions.sireName, searchOptions.order],
    );
  }

  /* Get Stallion Dam Sire Names Data */
  async findDamSireByName(searchOptions: DamSireNameSearchDto) {
    return await this.stallionRepository.manager.query(
      `EXEC proc_SMPGetStallionDamSireName 
                     @DamSireName=@0,
                     @SortOrder=@1`,
      [searchOptions.damSireName, searchOptions.order],
    );
  }

  /* Get All DamSires By Stallions */
  async findMyDamSireBySearched() {
    let stallions = await this.farmService.getAllMyStallions();
    let stallionUuids = [];
    if (stallions && stallions.length > 0) {
      stallions.forEach((item) => {
        stallionUuids.push(item.stallionId);
      });
    }
    let queryBuilder = getRepository(SearchStallionMatch)
      .createQueryBuilder('ssm')
      .select('DISTINCT sire.horseUuid damsireId')
      .addSelect('sire.horseName as damsireName')
      .innerJoin('ssm.stallion', 'stallion')
      .innerJoin('ssm.mare', 'horse', 'horse.isVerified=1 AND horse.isActive=1')
      .innerJoin('horse.sire', 'sire', 'sire.isVerified=1 AND sire.isActive=1')
      .andWhere('stallion.stallionUuid IN (:...stallionUuids)', {
        stallionUuids: stallionUuids,
      })
      .getRawMany();

    return queryBuilder;
  }

  /* Get Stallion Grand Sire Names */
  async findGrandSireByName(searchOptions: GrandSireNameSearchDto) {
    return await this.stallionRepository.manager.query(
      `EXEC proc_SMPGetStallionGrandSireName 
                     @GrandSireName=@0,
                     @SortOrder=@1`,
      [searchOptions.grandSireName, searchOptions.order],
    );
  }

  /* Get Stallion Dam Sire Names */
  async findDamsByName(searchOptions: DamNameSearchDto) {
    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damHorse.horseName as damName, damHorse.yob as damYob, damHorse.horseUuid as damId, damHorse.id as damProgenyId, country.countryCode',
      )
      .innerJoin('damHorse.nationality', 'country')
      .andWhere('damHorse.horseName IS NOT NULL');

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select(
        'DISTINCT dam.damId as horseId, dam.damName as horseName, dam.damYob as yob',
      )
      .addSelect('dam.countryCode')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.damId',
      );

    queryBuilder
      .andWhere('stallion.isVerified = :isVerified', { isVerified: true })
      .andWhere('stallion.isActive = :isActive', { isActive: true });

    if (searchOptions.damName) {
      queryBuilder.andWhere('damName like :damName', {
        damName: `%${searchOptions.damName}%`,
      });
    }

    queryBuilder.orderBy('dam.damName', searchOptions.order);
    const entities = await queryBuilder.getRawMany();

    return entities;
  }

  /* Get Stallions By Fee Range */
  async findStallionsInFeeRange(searchOptionsDto: FeeRangeSearchDto) {
    if (!searchOptionsDto.location || !searchOptionsDto.currency) {
      throw new UnprocessableEntityException('Missing country/currency data!');
    }
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

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select('stallion.stallionUuid AS stallionId')
      .addSelect('farm.farmName AS farmName')
      .addSelect('horse.horseName AS horseName')
      .addSelect(
        'stallionservicefee.fee AS fee, (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) AS convFee',
      )
      .addSelect(
        'stallionservicefee.feeYear AS feeYear, stallionservicefee.isPrivateFee AS isPrivateFee',
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
      .leftJoin('stallionlocation.state', 'state');

    queryBuilder
      .andWhere('stallion.isActive=:isActive', { isActive: 1 })
      .andWhere('stallion.isVerified=:isVerified', { isVerified: 1 });

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
          '(stallionlocation.countryId  IN (:...countryList) OR state.id IN (:...stateList))',
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
        queryBuilder.andWhere('state.id  IN (:...stateList)', {
          stateList: stateListData,
        });
      }
    }
    if (searchOptionsDto.priceRange) {
      const priceRange = searchOptionsDto.priceRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2) {
        let minPrice = priceList[0];
        let maxPrice = priceList[1];
        if (searchOptionsDto.includePrivateFee) {
          if (maxPrice === '10000000') {
            queryBuilder.andWhere(
              '(((stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1)',
              {
                minPrice,
              },
            );
          } else {
            queryBuilder.andWhere(
              '(((stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) <= :maxPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1)',
              {
                minPrice,
                maxPrice,
              },
            );
          }
        } else {
          if (maxPrice === '10000000') {
            queryBuilder.andWhere(
              '(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND stallionservicefee.isPrivateFee=0',
              {
                minPrice,
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
      }
    } else {
      if (!searchOptionsDto.includePrivateFee) {
        queryBuilder.andWhere(
          'stallionservicefee.isPrivateFee = :isPrivateFee',
          {
            isPrivateFee: 0,
          },
        );
      }
    }
    queryBuilder.orderBy('horse.horseName', searchOptionsDto.order);
    const entitiesWithoutLimit = await queryBuilder.getRawMany();
    let min = 0,
      max = 10000000;
    if (
      searchOptionsDto.currency ||
      searchOptionsDto.location ||
      searchOptionsDto.priceRange ||
      searchOptionsDto.includePrivateFee ||
      !searchOptionsDto.includePrivateFee
    ) {
      min = Math.round(
        Math.min(
          ...entitiesWithoutLimit.map((item) =>
            item.isPrivateFee ? 0 : item.convFee,
          ),
        ),
      );
      max = Math.round(
        Math.max(
          ...entitiesWithoutLimit.map((item) =>
            item.isPrivateFee ? 0 : item.convFee,
          ),
        ),
      );
    }

    return {
      data: entitiesWithoutLimit,
      priceRange: { min, max },
      length: entitiesWithoutLimit.length,
    };
  }

  /* Get Stallions Min Max Prices */
  async minMaxPrice(searchOptionsDto: SearchOptionsDto) {
    let destinationCurrencyCode = this.configService.get('app.defaultCurrency');
    if (searchOptionsDto?.currency) {
      let currencyData = await this.currenciesService.findOne(
        searchOptionsDto?.currency,
      );
      if (currencyData) {
        destinationCurrencyCode = currencyData.currencyCode;
      }
    }

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

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select('stallion.stallionUuid as stallionId')
      .addSelect(
        'stallionservicefee.fee as fee, (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) AS convFee',
      )
      .addSelect(
        'stallionservicefee.feeYear as feeYear, stallionservicefee.isPrivateFee as isPrivateFee',
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
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horse.id',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.id',
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
      .leftJoin('stallion.stallionnomination', 'nomination')
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=promotion.id',
      );
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
          'sireTwo',
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
        await this.horseService.getAllAncestorHorsesByHorseId(
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

    queryBuilder
      .andWhere('stallion.isActive=:isActive', { isActive: 1 })
      .andWhere('stallion.isVerified=:isVerified', { isVerified: 1 });

    if (searchOptionsDto.farms) {
      let farms = searchOptionsDto.farms.split(',');
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
    if (searchOptionsDto.stallionId) {
      queryBuilder.andWhere('horse.horseUuid = :stallionId', {
        stallionId: searchOptionsDto.stallionId,
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
      let yearToStud = searchOptionsDto.yearToStud.split(',');
      let yearToStudList = yearToStud.map((res) => parseInt(res));
      queryBuilder.andWhere('stallion.yearToStud  IN (:...yearToStud)', {
        yearToStud: yearToStudList,
      });
    }
    if (searchOptionsDto.colour) {
      let colour = searchOptionsDto.colour.split(',');
      let colourList = colour.map((res) => parseInt(res));
      queryBuilder.andWhere('colour.colourDominancyId IN (:...colour)', {
        colour: colourList,
      });
    }

    if (searchOptionsDto.promoted) {
      queryBuilder.andWhere(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END = :isPromoted',
        { isPromoted: searchOptionsDto.promoted },
      );
    }

    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      switch (sortBy.toLowerCase()) {
        case 'promoted':
          queryBuilder
            .addOrderBy(
              'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END',
              'DESC',
            )
            .addOrderBy('horse.horseName', 'ASC');
          break;
        case 'stud fee':
          queryBuilder.addOrderBy(
            'CASE WHEN stallionservicefee.isPrivateFee=0 THEN 1 ELSE 0 END',
            'DESC',
          );
          queryBuilder.addOrderBy(
            '(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate))',
            'DESC',
          );
          break;
        case 'recently updated':
          queryBuilder.addOrderBy('stallion.modifiedOn', 'DESC');
          break;
        case 'available nominations':
          queryBuilder
            .addOrderBy(
              'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END',
              'DESC',
            )
            .addOrderBy(
              'CASE WHEN getutcdate() BETWEEN nomination.startDate AND nomination.endDate THEN 1 ELSE 0 END',
              'DESC',
            )
            .addOrderBy('nomination.noOfNominations', 'DESC')
            .addOrderBy('horse.horseName', 'ASC');
          break;
        case 'alphabetical':
          queryBuilder.addOrderBy('horse.horseName', 'ASC');
          break;
        default:
          queryBuilder.addOrderBy('horse.horseName', 'ASC');
      }
    }
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
          if (maxPrice === '10000000') {
            queryBuilder.andWhere(
              '(((stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1)',
              {
                minPrice,
              },
            );
          } else {
            queryBuilder.andWhere(
              '(((stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) <= :maxPrice AND stallionservicefee.isPrivateFee=0) OR stallionservicefee.isPrivateFee=1)',
              {
                minPrice,
                maxPrice,
              },
            );
          }
        } else {
          if (maxPrice === '10000000') {
            queryBuilder.andWhere(
              '(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND stallionservicefee.isPrivateFee=0',
              {
                minPrice,
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
      }
    } else {
      if (!searchOptionsDto.isPrivateFee) {
        queryBuilder.andWhere(
          'stallionservicefee.isPrivateFee = :isPrivateFee',
          {
            isPrivateFee: 0,
          },
        );
      }
    }

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
      searchOptionsDto.keyAncestorId ||
      !searchOptionsDto.isExcludeKeyAncestor ||
      !searchOptionsDto.isPrivateFee
    ) {
      min = Math.round(
        Math.min(
          ...entitiesWithoutLimit.map((item) =>
            item.isPrivateFee ? 0 : item.convFee,
          ),
        ),
      );
      max = Math.round(
        Math.max(
          ...entitiesWithoutLimit.map((item) =>
            item.isPrivateFee ? 0 : item.convFee,
          ),
        ),
      );
    }

    return { priceRange: { min, max }, length: entitiesWithoutLimit.length };
  }

  /* Get Stallion By Name */
  async findStallionsByName(searchOptions: StallionNameSearchDto) {
    const data = await this.stallionRepository.manager.query(
      `EXEC procSearchStallionByName @stallionName=@0`,
      [searchOptions.stallionName],
    );

    return data;
  }

  /* Get Mare By Name */
  async findMaresByName(searchOptions: MareNameSearchDto) {
    const data = await this.stallionRepository.manager.query(
      `EXEC procSearchMareByName @mareName=@0`,
      [searchOptions.mareName],
    );

    return data;
  }

  /* Create a new stallion */
  async create(data: CreateStallionDto) {
    let isDuplicateStallionForSameRegion = false;
    const member = this.request.user;
    const { farmId } = data;
    let farm = await this.farmService.findOne({ farmUuid: farmId });
    if (!farm) {
      throw new HttpException('Farm not found', HttpStatus.NOT_FOUND);
    }
    let horsesResult = await this.horseService.findHorsesByUuid(data.horseId);
    const existResult = await this.isStallionExist(horsesResult.id, farm.id);
    if (existResult) {
      throw new HttpException(
        'Stallion already exist to this Farm',
        HttpStatus.NOT_FOUND,
      );
    }
    //Get List of Stallions With Same HorseId and FarmCountry Combination
    let stallionsList = await this.getStallionsInFarmLocationByFarmIdAndHorseId(
      farm.farmUuid,
      horsesResult.horseUuid,
    );
    //Send notification/mail to super admin and admin users
    if (stallionsList.length > 0) {
      //Code here
      isDuplicateStallionForSameRegion = true;
    }
    data.createdBy = member['id'];
    const createDto = {
      ...data,
      horseId: horsesResult.id,
      farmId: farm.id,
      // isActive: isDuplicateStallionForSameRegion? false: true,
      // isVerified: isDuplicateStallionForSameRegion? false: true,
      isActive: true,
      isVerified: true,
      colourId: horsesResult.colourId,
    };
    const stallionResponse = await this.stallionRepository.save(
      this.stallionRepository.create(createDto),
    );
    let locationData = new CreateStallionLocationDto();
    let farmLocation = await this.farmLocationsService.findByFarmId(farm.id);
    locationData.countryId = farmLocation.countryId;
    locationData.stateId = farmLocation.stateId;
    locationData.stallionId = stallionResponse.id;
    locationData.createdBy = member['id'];
    await this.stallionLocationService.create(locationData);
    let feeData = new CreateStallionServiceFeeDto();
    feeData.currencyId = data.currencyId;
    feeData.fee = data.fee;
    feeData.feeYear = data.feeYear;
    feeData.isPrivateFee = data.isPrivateFee;
    feeData.feeUpdatedFrom = FeeUpdateEnum.FarmUpdate; //Farm Update
    feeData.stallionId = stallionResponse.id;
    feeData.createdBy = member['id'];
    await this.stallionServiceFeeService.create(feeData);
    this.sendMailForAddStallion(
      member,
      stallionResponse,
      farm,
      farmLocation,
      data,
      isDuplicateStallionForSameRegion,
    );
    return {
      statusCode: 200,
      message: 'Stallion added successfully',
      data: { stallionId: stallionResponse.stallionUuid },
    };
  }

  /* Check Stallion Exist */
  async isStallionExist(horseId: number, farmId: number) {
    try {
      const record = await this.stallionRepository.findOne({
        horseId,
        farmId,
        isRemoved: false,
      });
      return record;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  /* Check Stallion Exist In Farm Country(Region) */
  async getStallionsInFarmLocationByFarmIdAndHorseId(
    farmId: string,
    horseId: string,
  ) {
    const data = await this.stallionRepository.manager.query(
      `EXEC procGetStallionsInFarmLocationByFarmIdAndHorseId @farmId=@0, @horseId=@1`,
      [farmId, horseId],
    );
    return data;
  }

  /* Update a stallion service fee */
  async serviceFeeUpdate(
    stallionUuid: string,
    createFeeDto: CreateStallionServiceFeeDto,
  ) {
    const stallion = await this.stallionRepository.findOne({
      stallionUuid: stallionUuid,
    });
    const response = await this.getCompleteStallionInfo(stallionUuid);
    let farm = await this.farmService.findOne({ id: stallion.farmId });
    //  let horsesResult = await this.horseService.findOne(stallion.horseId);

    const member = this.request.user;
    const record = await this.getStallionByUuid(stallionUuid);
    createFeeDto.stallionId = record.id;
    createFeeDto.feeUpdatedFrom = FeeUpdateEnum.FarmUpdate; //Farm Update
    createFeeDto.createdBy = member['id'];
    await this.stallionServiceFeeService.create(createFeeDto);

    this.sendMailForUpdateStallion(member, response, farm);
    return;
  }

  /* Get Close Analytics of a new stallion */
  async getCloseAnalytics(searchOptionsDto: StallionReportSearchOptionDto) {
    const entities = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stallionId')
      .addSelect('horse.id as horseId')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .andWhere('stallion.stallionUuid = :stallionUuid', {
        stallionUuid: searchOptionsDto.stallionId,
      })
      .getRawOne();
    if (!entities) {
      throw new NotFoundException('Stallion not found');
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

    const finalData = await this.stallionRepository.manager.query(
      `EXEC proc_StallionRosterCloseAnalytics
                   @pstallionid=@0,
                   @pFromDate=@1,
                   @pToDate=@2
                   `,
      [entities.stallionId, fromDate, toDate],
    );
    return finalData;
  }

  /* Get Key Statistics of a stallion */
  async getKeyStatistics(searchOptionsDto: StallionReportSearchOptionDto) {
    const entities = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stallionId')
      .addSelect('horse.id as horseId')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .andWhere('stallion.stallionUuid = :stallionUuid', {
        stallionUuid: searchOptionsDto.stallionId,
      })
      .getRawOne();
    if (!entities) {
      throw new NotFoundException('Stallion not found');
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
    const finalData = await this.stallionRepository.manager.query(
      `EXEC proc_StallionRosterKeyStatistics
                   @pstallionid=@0,
                   @pFromDate=@1,
                   @pToDate=@2
                   `,
      [entities.stallionId, fromDate, toDate],
    );
    return finalData;
  }

  /* Get Stallion Latest Service Fee */
  async getLatestServiceFeeByYear(stallionUuid: string, feeYear: number) {
    const record = await this.getStallionByUuid(stallionUuid);
    return await this.stallionServiceFeeService.getLatestServiceFeeByYear(
      record.id,
      feeYear,
    );
  }

  /* Submit Remove Reason */
  async submitRemoveReason(id: string, reasonId: number) {
    let stallionRecord = await this.stallionRepository.findOne({
      stallionUuid: id,
    });
    if (!stallionRecord) {
      throw new UnprocessableEntityException('Stallion not exist!');
    }
    const member = this.request.user;
    const response = await this.stallionRepository.update(
      { id: stallionRecord.id },
      { reasonId: reasonId },
    );
    return {
      statusCode: 200,
      message: 'Reason updated successfully',
      data: {},
    };
  }

  /* Capture Stallion Page View */
  async stallionPageView(id: string, referrer) {
    const record = await this.getStallionByUuid(id);
    await this.pageViewService.createInit(
      record.id,
      PageViewEntityType.STALLION,
      referrer,
    );
  }

  /* Capture Stallion Social Share */
  async stallionSocialShare(id: string, socialShare) {
    const record = await this.getStallionByUuid(id);
    await this.memberSocialShareService.createInit(
      record.id,
      PageViewEntityType.STALLION,
      socialShare,
    );
  }

  /* Get Stallion Race Records */
  async getStallionRaceRecords(stallionId: string) {
    const record = await this.getStallionByUuid(stallionId);

    let raceDescriptionData = await this.stallionRepository.manager.query(
      `EXEC proc_SMPRaceRecord 
                     @phorseid=@0`,
      [record.horseId],
    );

    let raceRecords = [];
    let raceRecordsDescription = [];
    let ages = [];
    let totalStarts = 0;
    let totalFirst = 0;
    let totalSecond = 0;
    let totalThird = 0;
    let totalFourth = 0;
    raceDescriptionData.map((record: any) => {
      if (record.Result === 'TABLE') {
        raceRecords.push({
          age: record.Age,
          starts: record.Starts,
          first: record[1],
          second: record[2],
          third: record[3],
          fourth: record[4],
        });
        totalStarts = totalStarts + record.Starts;
        totalFirst = totalFirst + record[1];
        totalSecond = totalSecond + record[2];
        totalThird = totalThird + record[3];
        totalFourth = totalFourth + record[4];
      } else {
        if (!raceRecordsDescription[record.Age]) {
          raceRecordsDescription[record.Age] = [];
        }
        if (record.Age) {
          ages.push(record.Age);
          raceRecordsDescription[record.Age].push({
            age: record.Age,
            position: record.position,
            raceName: record.raceName,
            stakeName: record.stakeName,
            raceDistance: record.raceDistance,
            distanceCode: record.distanceCode,
            venueName: record.venueName,
            description: record.description,
          });
        }
      }
    });
    if (raceRecords.length) {
      raceRecords.push({
        age: 'Total',
        starts: totalStarts,
        first: totalFirst,
        second: totalSecond,
        third: totalThird,
        fourth: totalFourth,
      });
    }
    let finalList: any = raceRecordsDescription.filter(function (item) {
      return item != null;
    });

    return {
      raceRecords,
      raceRecordsDescription: finalList,
      ages: ages.filter((item, i, ar) => ar.indexOf(item) === i),
    };
  }

  /* Get Similar Stallions */
  async getSimilarStallion(searchOptionsDto: SearchSimilarStallionDto) {
    const member = this.request.user;
    let scntQuery = getRepository(SearchStallionMatch)
      .createQueryBuilder('ssm')
      .select('ssm.id as id, stallion.stallionUuid as stallionId')
      .innerJoin('ssm.stallion', 'stallion')
      .andWhere('ssm.createdBy = :createdBy', { createdBy: member['id'] })
      .orderBy('ssm.id', 'DESC');
    const searchedStallion = await scntQuery.getRawOne();
    if (!searchedStallion) {
      return [];
    }
    const record = await this.getCompleteStallionInfo(
      searchedStallion['stallionId'],
    );
    const data = new SimilarStallionWithLocationFeeDto();
    data['stallionId'] = record['stallionId'];
    data['countryId'] = record['countryId'];
    data['priceRange'] = record['fee'].toString();
    data['currencyId'] = record['currencyId'];
    data['order'] = searchOptionsDto['order'];
    data['page'] = searchOptionsDto['page'];
    data['limit'] = searchOptionsDto['limit'];
    let entities = await this.getSimilarStallionFeeRange(
      record['horseName'],
      data,
    );
    if (!entities?.data?.length) {
      data['priceRange'] =
        this.subtractPercentage(record['fee'], 10) +
        '-' +
        this.addPercentage(record['fee'], 10);
      entities = await this.getSimilarStallionFeeRange(
        record['horseName'],
        data,
      );
    }
    if (!entities?.data?.length) {
      data['priceRange'] =
        this.subtractPercentage(record['fee'], 20) +
        '-' +
        this.addPercentage(record['fee'], 20);
      entities = await this.getSimilarStallionFeeRange(
        record['horseName'],
        data,
      );
    }
    return entities;
  }

  /* Add Percentage to Stallion */
  addPercentage(fee: number, percentage: number) {
    return fee + (fee * percentage) / 100;
  }

  /* Subtract Percentage from Stallion */
  subtractPercentage(fee: number, percentage: number) {
    return fee - (fee * percentage) / 100;
  }

  /* Get Similar Stallions By Fee Range */
  async getSimilarStallionFeeRange(
    similarStallionName: string,
    searchSimilarStallionWithLocationFeeDto: SimilarStallionWithLocationFeeDto,
  ) {
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

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select(
        'stallion.stallionUuid as stallionId, stallion.url, profileMediaUrl as profilePic, stallion.yearToStud, stallion.yearToRetired, stallion.overview, sgiMedia.mediaUrl as galleryImage, farm.farmName as farmName, ' +
          "'" +
          similarStallionName +
          "'" +
          ' as similarTo ',
      )
      .addSelect('horse.horseName, horse.yob')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'stallionservicefee.fee as fee, stallionservicefee.feeYear as feeYear, stallionservicefee.isPrivateFee as isPrivateFee',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .leftJoin('stallion.farm', 'farm')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .leftJoin('stallionlocation.state', 'state')
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
      .innerJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .innerJoin('stallionservicefee.currency', 'currency')
      .innerJoin(
        'stallionlocation.country',
        'country',
        'country.id = :countryId',
        { countryId: searchSimilarStallionWithLocationFeeDto.countryId },
      )
      .andWhere('stallion.stallionUuid != :stallionId', {
        stallionId: searchSimilarStallionWithLocationFeeDto.stallionId,
      });

    if (searchSimilarStallionWithLocationFeeDto.priceRange) {
      const priceRange = searchSimilarStallionWithLocationFeeDto.priceRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2) {
        let minPrice = priceList[0];
        let maxPrice = priceList[1];
        queryBuilder.andWhere(
          'stallionservicefee.fee >= :minPrice AND stallionservicefee.fee <= :maxPrice',
          {
            minPrice,
            maxPrice,
          },
        );
      } else {
        let minPrice = priceList[0];
        queryBuilder.andWhere('stallionservicefee.fee = :minPrice', {
          minPrice,
        });
      }
    }

    queryBuilder
      .orderBy('horse.horseName', searchSimilarStallionWithLocationFeeDto.order)
      .offset(searchSimilarStallionWithLocationFeeDto.skip)
      .limit(searchSimilarStallionWithLocationFeeDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchSimilarStallionWithLocationFeeDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  /* Get Popular Stallions */
  async findPopularStallions(
    member: Member,
    searchPopularOptionsDto: SearchPopularStallionsDto,
  ): Promise<PageDto<PopularStallionResponseDto[]>> {
    const fvrtFarmQueryBuilder = getRepository(FavouriteFarm)
      .createQueryBuilder('favouriteFarm')
      .select('favouriteFarm.id as id')
      .addSelect('farm.farmUuid as farmId, farm.farmName as farmName')
      .innerJoin(
        'favouriteFarm.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .andWhere('favouriteFarm.memberId=:memberId', { memberId: member['id'] });

    const favFarm = await fvrtFarmQueryBuilder.getRawMany();

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

    let scntQuery = getRepository(SearchStallionMatch)
      .createQueryBuilder('ssm')
      .select('ssm.stallionId, count(ssm.stallionId) searchCount')
      .groupBy('ssm.stallionId');

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
        'stallion.stallionUuid as stallionId, searchCount, stallion.url, profileMediaUrl as profilePic, stallion.yearToStud, stallion.yearToRetired, stallion.overview, sgiMedia.mediaUrl as galleryImage, farm.farmName',
      )
      .addSelect('horse.horseName, horse.yob')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'stallionservicefee.fee as fee, stallionservicefee.feeYear as feeYear, stallionservicefee.isPrivateFee as isPrivateFee',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .leftJoin('stallion.farm', 'farm')
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .leftJoin('stallion.stallionlocation', 'stallionlocation')
      .leftJoin('stallionlocation.state', 'state')
      .innerJoin(
        '(' + scntQuery.getQuery() + ')',
        'scnt',
        'scnt.stallionId=stallion.id',
      )
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
      .innerJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .innerJoin('stallionservicefee.currency', 'currency')
      .innerJoin('stallionlocation.country', 'country');

    if (favFarm && favFarm.length) {
      queryBuilder.innerJoin(
        'farm.favouritefarms',
        'favouritefarms',
        'favouritefarms.memberId=:memberId',
        { memberId: member.id },
      );
    } else {
      const memberAddress = await this.membersAddressService.findMemberAddress(
        member.id,
      );
      queryBuilder.andWhere('stallionlocation.countryId=:countryId', {
        countryId: memberAddress.countryId,
      });
    }

    queryBuilder.orderBy('scnt.searchCount', 'DESC');

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchPopularOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  /* Get Stallions By Location */
  async findAllByLocation(fields) {
    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select('stallion.stallionUuid as stallionId')
      .addSelect('horse.horseName as stallionName')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .leftJoin('stallion.stallionlocation', 'stallionlocation');

    if (fields.countryId && fields.stateId) {
      queryBuilder.andWhere(
        '(stallionlocation.countryId  =:countryId OR stallionlocation.stateId =:stateId)',
        { countryId: fields.countryId, stateId: fields.stateId },
      );
    }

    if (fields.countryId) {
      queryBuilder.andWhere('stallionlocation.countryId  =:countryId', {
        countryId: fields.countryId,
      });
    }

    if (fields.stateId) {
      queryBuilder.andWhere('stallionlocation.stateId  =:stateId', {
        stateId: fields.stateId,
      });
    }

    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /* Get Stallion Mare Hypomating Data */
  async getHypoMatingDetails(
    stallionId: string,
    mareId: string,
    generation: number,
    additionalInfo: HypoMatingAdditionalInfoDto,
  ) {
    const record = await this.getStallionByUuid(stallionId);
    const mareRecord = await this.horseService.findMareByUuid(mareId);
    const finalData = await this.stallionRepository.manager.query(
      `EXEC proc_SMPPerfectMatch 
                     @SireID=@0,
                     @DamID=@1,
                     @level=@2`,
      [record.horseId, mareRecord.id, generation],
    );
    const stallionData = await finalData.filter(
      (res) => res.HypoMating == 'HypoSire',
    );
    const mareData = await finalData.filter(
      (res) => res.HypoMating == 'HypoDam',
    );

    let stallion = await this.horseService.treePedigreeByHorseId(
      record,
      stallionData,
    );
    let mare = await this.horseService.treePedigreeByHorseId(
      mareRecord,
      mareData,
    );
    const response = {
      MatchResult: finalData.length > 0 ? finalData[0].MatchResult : '',
      Stallion: stallion,
      Mare: mare,
    };
    let isTwentytwentyMatch = false;
    let isPerfectMatch = false;
    if (
      response.MatchResult == '20/20 MATCH !' ||
      response.MatchResult == '20/20 MATCH'
    ) {
      isTwentytwentyMatch = true;
    }
    if (
      response.MatchResult == 'A PERFECT MATCH !' ||
      response.MatchResult == 'PERFECT MATCH'
    ) {
      isPerfectMatch = true;
    }
    let searchData = new CreateSmSearchDto();
    searchData.stallionId = record.id;
    searchData.mareId = mareRecord.id;
    searchData.isTwentytwentyMatch = isTwentytwentyMatch;
    searchData.isPerfectMatch = isPerfectMatch;
    let countryName = null;
    if (additionalInfo.countryName) {
      countryName = additionalInfo.countryName;
    }
    searchData.countryName = countryName;
    await this.searchSMService.create(searchData);

    if (response) {
      let stallionFarmData = await this.farmService.getFarmLogoByFarmId(
        record.farmId,
      );
      let stallionProfileImageData =
        await this.getStallionProfilePicsByStallionId(record.id);
      return {
        stallionFarmLogo: stallionFarmData,
        stallionProfileImageData: stallionProfileImageData,
        ...response,
      };
    }
  }

  /* Get Stallion Stakes Progeny */
  async getStallionStakesProgeny(
    stallionId: string,
    searchOptionsDto: StakesProgenyPageOptionsDto,
  ) {
    const record = await this.getStallionByUuid(stallionId);
    let sortByOrder = 'DESC';
    let sortByColumnName = StallionStakesProgenySort.HORSENAME;
    if (searchOptionsDto.sortBy) {
      sortByColumnName = searchOptionsDto.sortBy;
    }
    if (sortByColumnName == StallionStakesProgenySort.HORSENAME) {
      sortByOrder = 'ASC';
    }
    let entities = await this.stallionRepository.manager.query(
      `EXEC proc_SMPStakesProgeny 
                     @phorseid=@0,
                     @page=@1,
                     @size=@2,
                     @sortByColumnName=@3,
                     @sortByType=@4`,
      [
        record.horseId,
        searchOptionsDto.page,
        searchOptionsDto.limit,
        sortByColumnName,
        sortByOrder,
      ],
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

  /* Get Stallions Overview By stallionId */
  async findStallionOverview(stallionUuid: string) {
    const stallion = await this.findStallion({ stallionUuid });
    if (!stallion) {
      throw new NotFoundException('Stallion not found');
    }
    let overview: any = stallion?.overview;
    if (!overview) {
      overview = await this.getStallionDynamicOverview(stallion);
    }
    return overview;
  }

  /* Get Stallion Profile Image By stallionId */
  async getStallionProfilePicsByStallionId(stallionId: number) {
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

    const queryBuilder = this.stallionRepository
      .createQueryBuilder('stallion')
      .select('profileMediaUrl as profilePic')
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'stallionprofileimage',
        'mediaStallionId=stallion.id',
      );

    queryBuilder
      .where('stallion.id = :stallionId', { stallionId: stallionId })
      .andWhere({ isActive: true });

    return await queryBuilder.getRawOne();
  }

  /* Get Matched Mares for a Stallion */
  async findMatchedMares(
    searchOptionsDto: SearchMostMatchedDamSireOptionDto,
    isPagination,
  ) {
    const entities = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stallionId')
      .addSelect('horse.id as horseId')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .andWhere('stallion.stallionUuid = :stallionUuid', {
        stallionUuid: searchOptionsDto.stallionId,
      })
      .getRawOne();

    if (!entities) {
      throw new NotFoundException('Stallion not found');
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

    if (isPagination) {
      const items = await this.stallionRepository.manager.query(
        `EXEC proc_SMPMatchMareStallionMatch
                     @pstallionid=@0,
                     @pFromDate=@1,
                     @pToDate=@2,
                     @IsPagination=@3,
                     @startRowindex=@4,
                     @pageSize=@5`,
        [
          entities.stallionId,
          fromDate,
          toDate,
          1,
          searchOptionsDto.page,
          searchOptionsDto.limit,
        ],
      );
      let totalRecCnt = 0;
      if (items && items.length > 0) totalRecCnt = items[0].TotRecordCount;
      return this.commonUtilsService.paginateForProc(
        items,
        searchOptionsDto.page,
        searchOptionsDto.limit,
        totalRecCnt,
      );
    } else {
      const items = await this.stallionRepository.manager.query(
        `EXEC proc_SMPMatchMareStallionMatch
                     @pstallionid=@0,
                     @pFromDate=@1,
                     @pToDate=@2,
                     @IsPagination=@3
                     `,
        [entities.stallionId, fromDate, toDate, 0],
      );
      return items;
    }
  }

  /* Send mail - Add Stallion */
  async sendMailForAddStallion(
    member,
    stallion,
    farm,
    farmLocation,
    data,
    isDuplicateStallionForSameRegion = false,
  ) {
    /*
     * isDuplicateStallionForSameRegion if true - will send email/notification to admins with different template
     */
    const recipient = await getRepository(Member).findOne({ id: member['id'] });
    const horse = await getRepository(Horse).findOne({
      id: stallion['horseId'],
    });
    const productData = await this.productService.getProductInfoByProductCode(
      PRODUCTCODES.PROMOTION_STALLION,
    );

    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
        member['id'],
      );

    if (!preferedNotification || preferedNotification.isActive) {
      let addNewStallionMailData = {
        to: recipient.email,
        subject: 'We have received your new stallion request',
        text: '',
        template: '/add-new-stallion',
        context: {
          farmName: await this.commonUtilsService.toTitleCase(farm.farmName),
          stallionName: await this.commonUtilsService.toTitleCase(
            horse.horseName,
          ),
        },
      };
      this.mailService.sendMailCommon(addNewStallionMailData);

      const fee = productData.currencyCode + ' ' + productData.price;
      let mailData = {
        to: recipient.email,
        subject: 'Stallion Added',
        text: '',
        template: '/success-stallion',
        context: {
          farmAdminName: await this.commonUtilsService.toTitleCase(
            recipient.fullName,
          ),
          stallionName: await this.commonUtilsService.toTitleCase(
            horse.horseName,
          ),
          fee: fee,
          renewDate: '',
          promotUrl:
            process.env.FRONTEND_DOMAIN +
            '/stallion-roster/' +
            farm.farmName +
            '/' +
            farm.farmUuid,
        },
      };

      this.mailService.sendMailCommon(mailData);
      let memberAddress = await this.membersAddressService.findMemberAddress(
        member.id,
      );
      const messageTemplate =
        await this.messageTemplatesService.getMessageTemplateByUuid(
          notificationTemplates.stallionCreatedUuid,
        );
      const messageText = messageTemplate.messageText
        .replace(
          '{userName}',
          await this.commonUtilsService.toTitleCase(recipient.fullName),
        )
        .replace(
          '{horseName}',
          await this.commonUtilsService.toTitleCase(horse.horseName),
        )
        .replace(
          '{farmName}',
          await this.commonUtilsService.toTitleCase(farm.farmName),
        )
        .replace(
          '{Location}',
          await this.commonUtilsService.toTitleCase(memberAddress?.countryName),
        );
      const messageTitle = messageTemplate.messageTitle;

      //If duplicate for region
      if (isDuplicateStallionForSameRegion) {
        //Code Here
        //Get Stallion Location
        let stallionLocationRecord =
          await this.stallionRepository.manager.query(
            `EXEC proc_SMPGetStallionLocationById
          @stallionId=@0`,
            [stallion.id],
          );
        let locationData = '';
        if (stallionLocationRecord.length > 0) {
          if (stallionLocationRecord[0].stateName) {
            locationData = `${stallionLocationRecord[0].stateName}, `;
          }
          locationData = locationData + stallionLocationRecord[0].countryName;
        }
        let adminRoleIdsStringFromConfig = this.configService.get(
          'app.adminUserRoleIds',
        );
        let adminRoleIdsString = adminRoleIdsStringFromConfig.split('|');
        const adminRoleIds = adminRoleIdsString.map((str) => Number(str));
        const admins = await getRepository(Member).find({
          where: {
            roleId: In(adminRoleIds),
            isArchived: false,
          },
        });
        //Duplicate Stallion Notification to Admin Users
        const duplicateStallionMessageTemplate =
          await this.messageTemplatesService.getMessageTemplateByUuid(
            notificationTemplates.stallionDuplicateIdentifiedUuid,
          );
        const duplicateStallionMessageText =
          duplicateStallionMessageTemplate.messageText
            .replace(
              '{stallionName}',
              await this.commonUtilsService.toTitleCase(horse.horseName),
            )
            .replace(
              '{stallionLocation}',
              await this.commonUtilsService.toTitleCase(locationData),
            );
        const duplicateStallionMessageTitle =
          duplicateStallionMessageTemplate.messageTitle;
        const actionUrl = duplicateStallionMessageTemplate.linkAction.replace(
          '{stallionId}',
          stallion.stallionUuid,
        );
        //Send Emails
        admins.forEach(async (adminUser) => {
          let mailData = {
            to: adminUser.email,
            data: {
              fullName: adminUser.fullName,
              stallionName: horse.horseName,
              stateAndCountryName: locationData,
              actionUrl: actionUrl,
            },
          };
          this.mailService.duplicateStallionWithInTheRegion(mailData);
          //Send Notification
          this.notificationsService.create({
            createdBy: member['id'],
            messageTemplateId: duplicateStallionMessageTemplate?.id,
            notificationShortUrl: 'notificationShortUrl',
            recipientId: adminUser.id,
            messageTitle: duplicateStallionMessageTitle,
            messageText: duplicateStallionMessageText,
            isRead: false,
            notificationType: preferedNotification?.notificationTypeId,
            actionUrl: actionUrl,
          });
        });
      } else {
        const supperAdminRoleId = parseInt(process.env.SUPER_ADMIN_ROLE_ID);
        const admins = await getRepository(Member).find({
          roleId: supperAdminRoleId,
        });
        admins.forEach(async (recipient) => {
          this.notificationsService.create({
            createdBy: member['id'],
            messageTemplateId: messageTemplate?.id,
            notificationShortUrl: 'notificationShortUrl',
            recipientId: recipient.id,
            messageTitle: messageTitle,
            messageText: messageText,
            isRead: false,
            notificationType: preferedNotification?.notificationTypeId,
          });
        });
      }

      const farmMembers = await this.farmService.getFarmMembers(farm.farmUuid);
      farmMembers.forEach(async (item) => {
        if (item.accessLevelId == 1 || item.accessLevelId == 2) {
          const farmUser = await getRepository(Member).findOne({
            memberuuid: item.memberId,
          });
          if (member['id'] != farmUser.id) {
            this.notificationsService.create({
              createdBy: member['id'],
              messageTemplateId: messageTemplate?.id,
              notificationShortUrl: 'notificationShortUrl',
              recipientId: farmUser.id,
              messageTitle: messageTitle,
              messageText: messageText,
              isRead: false,
              notificationType: preferedNotification?.notificationTypeId,
            });
          }
        }
      });
    }
    //Send Mail to Admin - Add Stallion Request
    const supperAdminRoleId = parseInt(process.env.SUPER_ADMIN_ROLE_ID);
    const admins = await getRepository(Member).find({
      roleId: supperAdminRoleId,
    });
    const feeCurrencyData = await this.currenciesService.findOne(
      data.currencyId,
    );
    const countryData = await this.countryService.findByCountryId(
      farmLocation.countryId,
    );
    let stateData;
    if (farmLocation.stateId) {
      stateData = await this.statesService.findOne(farmLocation.stateId);
    }
    let locationData = '';
    if (stateData?.stateCode) {
      locationData =
        (await this.commonUtilsService.toTitleCase(stateData?.stateCode)) + ', ';
    }
    locationData =
      locationData +
      (await this.commonUtilsService.toTitleCase(countryData.countryName));
    //farmLocation
    let studFee
    studFee = `${feeCurrencyData.currencyCode}`
    if (feeCurrencyData.currencySymbol) {
      studFee = studFee + ` ${
        feeCurrencyData.currencySymbol
      }`;
    }
    studFee = studFee + `${await this.commonUtilsService.insertCommas(data.fee)}`
    admins.forEach(async (adminUser) => {
      let mailData = {
        to: adminUser.email,
        subject: 'New stallion request!',
        text: '',
        template: '/add-stallion-request',
        context: {
          locationData: locationData,
          toName: await this.commonUtilsService.toTitleCase(adminUser.fullName),
          fromName: await this.commonUtilsService.toTitleCase(
            recipient.fullName,
          ),
          farmName: await this.commonUtilsService.toTitleCase(farm.farmName),
          stallionName: await this.commonUtilsService.toTitleCase(
            horse.horseName,
          ),
          studFee: studFee,
          stallionPageUrl:
          `${this.configService.get('file.systemActivityAdminDomain')}/marketing/data/stallion/${stallion.stallionUuid}/filterbystallionid`,
          messagesPageUrl: process.env.FRONTEND_DOMAIN + '/messages',
        },
      };
      this.mailService.sendMailCommon(mailData);
      //Add new stallion to Admin
      let newStallionUpdateMailData = {
        to: adminUser.email,
        subject: 'Stallion Recently Added!',
        text: '',
        template: '/new-stallion-update-admin',
        context: {
          toName: await this.commonUtilsService.toTitleCase(adminUser.fullName),
          fromName: await this.commonUtilsService.toTitleCase(
            recipient.fullName,
          ),
          farmName: await this.commonUtilsService.toTitleCase(farm.farmName),
          stallionName: await this.commonUtilsService.toTitleCase(
            horse.horseName,
          ),
          stallionPageUrl:
          `${this.configService.get('file.systemActivityAdminDomain')}/marketing/data/stallion/${stallion.stallionUuid}/filterbystallionid`,
        },
      };
      this.mailService.sendMailCommon(newStallionUpdateMailData);
    });
  }

  /* Get Stallion Progeny Tracker */
  async getStallionProgenyTracker(
    searchOptionsDto: SearchMostMatchedDamSireOptionDto,
    isPagination,
  ) {
    const record = await this.getStallionByUuid(searchOptionsDto.stallionId);
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

    let entities = await this.stallionRepository.manager.query(
      `EXEC proc_SMPProgenyTracker 
                     @phorseid=@0,
                     @pFromDate=@1,
                     @pToDate=@2,
                     @IsPagination=@3,
                     @page=@4,
                     @size=@5`,

      [
        record.horseId,
        fromDate,
        toDate,
        isPagination,
        searchOptionsDto.page,
        searchOptionsDto.limit,
      ],
    );
    const records = await entities.filter((res) => res.filterType == 'record');
    const countRecord = await entities.filter(
      (res) => res.filterType == 'total',
    );
    if (isPagination) {
      const pageMetaDto = new PageMetaDto({
        itemCount: countRecord[0].totalRecords,
        pageOptionsDto: searchOptionsDto,
      });
      return new PageDto(records, pageMetaDto);
    } else {
      return records;
    }
  }

  /* Send mail - Update Stallion */
  async sendMailForUpdateStallion(member, stallion, farm) {
    const recipient = await getRepository(Member).findOne({ id: member['id'] });

    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
        member['id'],
      );

    if (!preferedNotification || preferedNotification.isActive) {
      const fee = stallion.currencyCode + ' ' + stallion.fee;
      let mailData = {
        to: recipient.email,
        subject: 'Stallion Updated',
        text: '',
        template: '/stallion-updated',
        context: {
          farmAdminName: await this.commonUtilsService.toTitleCase(
            recipient.fullName,
          ),
          stallionName: await this.commonUtilsService.toTitleCase(
            stallion.horseName,
          ),
          fee: fee,
          renewDate: '',
          stallionPageUrl:
            process.env.FRONTEND_DOMAIN +
            '/stallions/' +
            stallion.horseName +
            '/' +
            stallion.stallionId,
        },
      };

      this.mailService.sendMailCommon(mailData);
    }
  }

  /* Download stallion report */
  async downloadStallionReport(
    searchOptionsDto: StallionReportSearchOptionDto,
  ) {
    const queryBuilder = await this.findStallionInfo(
      searchOptionsDto.stallionId,
    );
    let keyStatistics = await this.getKeyStatisticsForReport(searchOptionsDto);
    let closeAnalytics = await this.getCloseAnalyticsForReport(
      searchOptionsDto,
    );
    let matchedMareDto = new SearchMostMatchedDamSireOptionDto();
    matchedMareDto.stallionId = searchOptionsDto.stallionId;
    matchedMareDto.fromDate = searchOptionsDto.fromDate;
    matchedMareDto.toDate = searchOptionsDto.toDate;
    matchedMareDto.filterBy = searchOptionsDto.filterBy;
    let matchedMares = await this.findMatchedMares(matchedMareDto, 0);
    await matchedMares.reduce(async (promise, item) => {
      await promise;
      item.totalPrizeMoneyEarned = await this.commonUtilsService.insertCommas(
        item.totalPrizeMoneyEarned,
      );
      item.mareName = await this.commonUtilsService.toTitleCase(item.mareName);
      item.sireName = await this.commonUtilsService.toTitleCase(item.sireName);
      item.damName = await this.commonUtilsService.toTitleCase(item.damName);
    }, Promise.resolve());

    await matchedMares.sort((a, b) => {
      if (a.mareName < b.mareName) {
        return -1;
      }
      if (a.mareName > b.mareName) {
        return 1;
      }
      return 0;
    });

    let progenyTracker = await this.getStallionProgenyTracker(
      matchedMareDto,
      0,
    );
    let stallionMatchActivity =
      await this.searchSMService.stallionMatchActivity(searchOptionsDto);
    var month = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    let smSearchesDataset = [],
      ttMatchesDataset = [],
      perfectMatchesDataset = [],
      lablesOfLineChart = [];
    let xKey = stallionMatchActivity[0].xKey;
    stallionMatchActivity[0].data.forEach((item) => {
      let label = '';
      if (xKey === 'days') {
        let index: any = new Date().getMonth();
        label = item.createdOn + ' ' + month[index];
      } else if (xKey === 'months') {
        label = month[item.createdOn - 1];
      } else if (xKey === 'years' || xKey === 'year') {
        label = item.createdOn;
      }
      lablesOfLineChart.push(label !== '' ? label : item.createdOn);
      ttMatchesDataset.push(item.ttMatches);
      smSearchesDataset.push(item.smSearches);
      perfectMatchesDataset.push(item.perfectMatches);
    });
    if (
      searchOptionsDto.filterBy.toLowerCase() === 'today' ||
      (smSearchesDataset.length == 1 &&
        ttMatchesDataset.length == 1 &&
        perfectMatchesDataset.length == 1)
    ) {
      lablesOfLineChart.push('');
    }

    let data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      stallionName: await this.commonUtilsService.toTitleCase(
        queryBuilder?.horseName,
      ),
      serviceFee:
        queryBuilder?.currencySymbol +
        (await this.commonUtilsService.insertCommas(queryBuilder?.fee)),
      yob: queryBuilder?.yob,
      profilePic: queryBuilder?.profilePic
        ? queryBuilder?.profilePic
        : process.env.DEFAULT_STALLION_PROFILE_IMAGE,
      infoIcon: process.env.INFO_ICON,
      profileRating: queryBuilder.profileRating
        ? queryBuilder.profileRating
        : 0,
      reportDateRange:
        (await this.commonUtilsService.dateFormate(
          new Date(searchOptionsDto.fromDate),
        )) +
        ' - ' +
        (await this.commonUtilsService.dateFormate(
          new Date(searchOptionsDto.toDate),
        )),
      keyStatistics: await this.setKeyStatisticsNullToZero(keyStatistics[0]),
      matchedMares: matchedMares,
      progenyTracker: progenyTracker,
      closeAnalytics: await this.setNullToZero(closeAnalytics[0]),
    };

    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/stallion-report.html',
      ),
      'utf-8',
    );
    contents = contents.replace(
      `SM_SEARCHES_DATA`,
      `SM_SEARCHES_DATA = ` + JSON.stringify(smSearchesDataset),
    );
    contents = contents.replace(
      `TT_MATCHES_DATA`,
      `TT_MATCHES_DATA = ` + JSON.stringify(ttMatchesDataset),
    );
    contents = contents.replace(
      `PERFECT_MATCHES_DATA`,
      `PERFECT_MATCHES_DATA = ` + JSON.stringify(perfectMatchesDataset),
    );
    contents = contents.replace(
      `LABLES_OF_LINE_CHART`,
      `LABLES_OF_LINE_CHART = ` + JSON.stringify(lablesOfLineChart),
    );
    contents = contents.replace(
      `PROGRESS_BAR`,
      `PROGRESS_BAR = ` +
        JSON.stringify(
          queryBuilder.profileRating ? queryBuilder.profileRating : 0,
        ),
    );
    let s3ReportLocation = await this.htmlToPdfService.generatePDF(
      contents,
      `${this.configService.get(
        'file.s3DirStallionReportPdf',
      )}/reports/${uuid()}/stallion-report.pdf`,
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

  async setNullToZero(closeAnalytics) {
    for (const key in closeAnalytics) {
      if (closeAnalytics.hasOwnProperty(key)) {
        if (!closeAnalytics[key]) {
          closeAnalytics[key] = 0;
        } else {
          closeAnalytics[key] = parseInt(closeAnalytics[key]);
        }
      }
    }

    closeAnalytics['SMSearchesDiff'] = Math.abs(
      closeAnalytics['SMSearches'] - closeAnalytics['PreviousSMSearches'],
    );
    closeAnalytics['TwentyTwentyMatchesDiff'] = Math.abs(
      closeAnalytics['TwentyTwentyMatches'] -
        closeAnalytics['PreviousTwentyTwentyMatches'],
    );
    closeAnalytics['PerfectMatchesDiff'] = Math.abs(
      closeAnalytics['PerfectMatches'] -
        closeAnalytics['PreviousPerfectMatches'],
    );
    closeAnalytics['PageViewsDiff'] =
      closeAnalytics['PageViews'] - closeAnalytics['PreviousPageViews'];
    closeAnalytics['MessagesDiff'] =
      closeAnalytics['Messages'] - closeAnalytics['PreviousMessages'];
    closeAnalytics['NominationsDiff'] =
      closeAnalytics['Nominations'] - closeAnalytics['PreviousNominations'];

    if (closeAnalytics['PreviousPageViews']) {
      closeAnalytics['PageViewsDiffPercent'] = Math.round(
        (closeAnalytics['PageViewsDiff'] /
          closeAnalytics['PreviousPageViews']) *
          100,
      );
    } else {
      closeAnalytics['PageViewsDiffPercent'] = Math.round(
        closeAnalytics['PageViewsDiff'] / 0.01,
      );
    }

    if (closeAnalytics['PreviousMessages']) {
      closeAnalytics['MessagesDiffPercent'] = Math.round(
        (closeAnalytics['MessagesDiff'] / closeAnalytics['PreviousMessages']) *
          100,
      );
    } else {
      closeAnalytics['MessagesDiffPercent'] = Math.round(
        closeAnalytics['MessagesDiff'] / 0.01,
      );
    }
    if (closeAnalytics['PreviousNominations']) {
      closeAnalytics['NominationsDiffPercent'] = Math.round(
        (closeAnalytics['NominationsDiff'] /
          closeAnalytics['PreviousNominations']) *
          100,
      );
    } else {
      closeAnalytics['NominationsDiffPercent'] = Math.round(
        closeAnalytics['NominationsDiff'] / 0.01,
      );
    }

    closeAnalytics['PageViewsDiff'] = Math.abs(closeAnalytics['PageViewsDiff']);
    closeAnalytics['MessagesDiff'] = Math.abs(closeAnalytics['MessagesDiff']);
    closeAnalytics['NominationsDiff'] = Math.abs(
      closeAnalytics['NominationsDiff'],
    );

    return closeAnalytics;
  }

  async setKeyStatisticsNullToZero(keyStatistics) {
    for (const key in keyStatistics[0]) {
      if (keyStatistics.hasOwnProperty(key)) {
        if (!keyStatistics[key]) {
          keyStatistics[key] = 0;
        } else {
          keyStatistics[key] = parseInt(keyStatistics[key]);
        }
      }
    }

    keyStatistics['TotalRunnersDiff'] = Math.abs(
      keyStatistics['TotalRunners'] - keyStatistics['PreviousTotalRunners'],
    );
    keyStatistics['TotalWinnersDiff'] = Math.abs(
      keyStatistics['TotalWinners'] - keyStatistics['PreviousTotalWinners'],
    );
    keyStatistics['TotalStakeWinnersDiff'] = Math.abs(
      keyStatistics['TotalStakeWinners'] -
        keyStatistics['PreviousTotalStakeWinners'],
    );
    keyStatistics['StakeWinnersRunnersPercDiff'] = Math.abs(
      keyStatistics['StakeWinnersRunnersPerc'] -
        keyStatistics['PreviousStakeWinnersRunnersPerc'],
    );
    keyStatistics['MaleRunnersDiff'] = Math.abs(
      keyStatistics['MaleRunners'] - keyStatistics['PreviousMaleRunners'],
    );
    keyStatistics['FemaleRunnersDiff'] = Math.abs(
      keyStatistics['FemaleRunners'] - keyStatistics['PreviousFemaleRunners'],
    );
    keyStatistics['WinnersRunnersPercDiff'] = Math.abs(
      keyStatistics['WinnersRunnersPerc'] -
        keyStatistics['PreviousWinnersRunnersPerc'],
    );

    keyStatistics['MaleRunnersCurrPerc'] = await this.getPercValue(
      keyStatistics['MaleRunners'],
      keyStatistics['FemaleRunners'],
    );
    keyStatistics['PreviousMaleRunnersPerc'] = await this.getPercValue(
      keyStatistics['PreviousMaleRunners'],
      keyStatistics['PreviousFemaleRunners'],
    );

    return keyStatistics;
  }

  async getPercValue(a: any, b: any) {
    let percValue: any = 0;
    if (a && b) {
      percValue = ((a / b) * 100).toFixed(2);
    }
    if (!b) {
      percValue = 0;
    }
    return percValue;
  }

  /* Get CloseAnalytics For Stallion Report */
  async getCloseAnalyticsForReport(
    searchOptionsDto: StallionReportSearchOptionDto,
  ) {
    const entities = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stallionId')
      .addSelect('horse.id as horseId')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .andWhere('stallion.stallionUuid = :stallionUuid', {
        stallionUuid: searchOptionsDto.stallionId,
      })
      .getRawOne();
    if (!entities) {
      throw new NotFoundException('Stallion not found');
    }
    let fromDate = new Date(); //applicable to today
    let toDate = new Date();
    const curr = new Date(); // get current date
    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'this month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
        // toDate = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
        toDate = curr;
      }
      if (filterBy.toLowerCase() === 'this week') {
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        fromDate = new Date(curr.setDate(first));
        toDate = new Date();
      }
      if (filterBy.toLowerCase() === 'this year') {
        fromDate = new Date(curr.getFullYear(), 0, 1);
        // toDate = new Date(curr.getFullYear(), 11, 31);
        toDate = curr;
      }
      if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
        }
      }
    }

    fromDate = await this.commonUtilsService.setHoursZero(fromDate);
    toDate = await this.commonUtilsService.setToMidNight(toDate);

    const finalData = await this.stallionRepository.manager.query(
      `EXEC proc_StallionReportCloseAnalytics
                   @pStallionId=@0,
                   @pFromDate=@1,
                   @pToDate=@2
                   `,
      [entities.stallionId, fromDate, toDate],
    );

    if (finalData.length) {
      await this.setNullToZero(finalData[0]);
    }
    return finalData;
  }

  /* Get Key Statistics For Stallion Report */
  async getKeyStatisticsForReport(
    searchOptionsDto: StallionReportSearchOptionDto,
  ) {
    const entities = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stallionId')
      .addSelect('horse.id as horseId')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .andWhere('stallion.stallionUuid = :stallionUuid', {
        stallionUuid: searchOptionsDto.stallionId,
      })
      .getRawOne();
    if (!entities) {
      throw new NotFoundException('Stallion not found');
    }
    let fromDate = new Date(); //applicable to today
    let toDate = new Date();
    const curr = new Date(); // get current date
    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'this month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
        // toDate = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
        toDate = curr;
      }
      if (filterBy.toLowerCase() === 'this week') {
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        fromDate = new Date(curr.setDate(first));
        toDate = new Date();
      }
      if (filterBy.toLowerCase() === 'this year') {
        fromDate = new Date(curr.getFullYear(), 0, 1);
        // toDate = new Date(curr.getFullYear(), 11, 31);
        toDate = curr;
      }
      if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
        }
      }
    }

    fromDate = await this.commonUtilsService.setHoursZero(fromDate);
    toDate = await this.commonUtilsService.setToMidNight(toDate);

    const finalData = await this.stallionRepository.manager.query(
      `EXEC proc_StallionReportKeyStatistics
                   @pStallionId=@0,
                   @pFromDate=@1,
                   @pToDate=@2
                   `,
      [entities.stallionId, fromDate, toDate],
    );
    return finalData;
  }

  /* Get Stallion Search By User */
  async findStallionsSearchedByUsers() {
    let stallions = await this.farmService.getAllMyStallions();
    let stallionIds = [];
    stallions.forEach((item) => {
      stallionIds.push(item.stallionId);
    });
    const queryBuilder = await getRepository(ActivityEntity)
      .createQueryBuilder('activity')
      .select('DISTINCT activity.stallionId, horse.horseName as stallionName')
      .innerJoin('activity.stallion', 'stallion')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .andWhere('activity.activityTypeId = :activityType', { activityType: ACTIVITY_TYPE.READ })
      .andWhere('stallion.isVerified = :isVerified', { isVerified: true })
      .andWhere('stallion.isActive = :isActive', { isActive: true })
      .andWhere('stallion.stallionUuid IN (:...stallionIds)', {
        stallionIds: stallionIds,
      });
    let entities = await queryBuilder.getRawMany();

    return entities;
  }

  /* Get Stallion Info Along with Farm */
  async getStallionWithFarm(stallionId: string) {
    const entities = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as id, stallion.stallionUuid as stallionId')
      .addSelect('horse.id as horseId, horse.horseName as horseName')
      .addSelect('farm.farmUuid as farmId, farm.farmName as farmName')
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .innerJoin('stallion.farm', 'farm')
      .andWhere('stallion.stallionUuid = :stallionUuid', {
        stallionUuid: stallionId,
      })
      .getRawOne();

    if (!entities) {
      throw new NotFoundException('Stallion not found');
    }
    return entities;
  }

  /* Get HorseTag - G1Pro etc */
  async getHorseTag(horseId: string) {
    const data = await this.stallionRepository.manager.query(
      `EXEC proc_HorseInfoInPedigree @phorseId=@0`,
      [horseId],
    );
    if (!data) {
      return null;
    }
    return data[0]['Tag'];
  }

  /* Get First Four Stallion Assosiated Farms */
  async getStallionFarms(stallionId: string) {
    const record = await this.getStallionByUuid(stallionId);
    return await this.stallionRepository.manager.query(
      `EXEC procGetSMPGetHorseFarms @horseId=@0`,
      [record.horseId],
    );
  }

  /* Get All Stallion Locations */
  async getAllStallionLocations() {
    let data = await this.stallionRepository.manager.query(
      `EXEC proc_SMPGetStallionLocations`,
    );
    return await this.commonUtilsService.getCountryStatesFromFilter(data);
  }

  /* Get Stallion And Farms - Footer Search */
  async footerSearch(searchOptions: footerSearchDto) {
    const data = await this.stallionRepository.manager.query(
      `EXEC proc_SMPFooterSearch @psearchchars=@0`,
      [searchOptions.keyWord],
    );

    let nerList = [];
    await data.reduce(async (promise, item) => {
      await promise;
      item.search.replace(
        item.name,
        await this.commonUtilsService.toTitleCase(item.name),
      );
      let search = item.search.replace(
        item.name,
        await this.commonUtilsService.toTitleCase(item.name),
      );
      nerList.push({
        name: item.name,
        search:
          item.type === 'Stallion' && item.farmName
            ? search + '- ' + item.farmName
            : search,
        type: item.type,
        uuid: item.uuid,
        farmName: item.farmName,
        isPromoted: item.isPromoted,
      });
    }, Promise.resolve());

    return nerList;
  }

  async getCurrency(productCode) {
    const product = await getRepository(Product).findOne({
      productCode: productCode,
    });
    const productId = product.id;
    const member = this.request.user;
    let currencyData = await this.stallionRepository.manager.query(
      `EXEC procGetSMPProductPricingByMemberIdAndProductId 
                     @memberId=@0, @productId=@1`,
      [member['id'], productId],
    );
    if (!currencyData.length) {
      let currencyData = await this.stallionRepository.manager.query(
        `EXEC procGetSMPDefaultProductPricingByProductId 
                       @productId=@0`,
        [productId],
      );
      return currencyData;
    }
    return currencyData;
  }
  async getCurrencyAllProducts(currencyDto: currencyDto) {
    var memberInfo = await getRepository(Member).findOne({
      memberuuid: currencyDto?.member,
    });
    var countryInfo = await getRepository(Country).findOne({
      countryName: currencyDto?.country,
    });

    let reportData = [];
    const member = memberInfo?.id;
    const country = countryInfo?.id;
    for (let i = 0; i < PRODUCTCODESLIST.length; i++) {
      var currencyData;
      let product = await getRepository(Product).findOne({
        productCode: PRODUCTCODESLIST[i],
      });
      const productId = product.id;
      if (currencyDto?.member) {
        currencyData = await this.stallionRepository.manager.query(
          `EXEC procGetSMPProductPricingByMemberIdAndProductId 
                        @memberId=@0, @productId=@1`,
          [member, productId],
        );

        if (currencyData?.length == 0) {
          currencyData = await this.currencyData(productId);
        }
        reportData.push(currencyData[0]);
      } else if (currencyDto?.country && country) {
        currencyData = await this.stallionRepository.manager.query(
          `EXEC procGetSMPProductPricingByCountryAndProductId 
                        @countryId=@0, @productId=@1`,
          [country, productId],
        );

        if (currencyData?.length == 0) {
          currencyData = await this.currencyData(productId);
        }
        reportData.push(currencyData[0]);
      }
    }
    return reportData;
  }
  async currencyData(productId) {
    const data = await this.stallionRepository.manager.query(
      `EXEC procGetSMPDefaultProductPricingByProductId 
                    @productId=@0`,
      [productId],
    );
    return data;
  }
}
