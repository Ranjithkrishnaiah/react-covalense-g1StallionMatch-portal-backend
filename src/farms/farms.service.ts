import {
  NotFoundException,
  UnprocessableEntityException,
  Scope,
  Inject,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateFarmDto } from './dto/create-farm.dto';
import { FarmLocationDto } from '../farm-locations/dto/farm-location.dto';
import { Farm } from './entities/farm.entity';
import { FarmLocationsService } from '../farm-locations/farm-locations.service';
import { PageDto } from 'src/utils/dtos/page.dto';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { FarmNameSearchDto } from './dto/farm-name-search.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { FarmMediaInfoService } from 'src/farm-media-info/farm-media-info.service';
import { CreateMediaDto } from 'src/farm-media-info/dto/create-media.dto';
import { UpdateMediaDto } from 'src/farm-media-info/dto/update-media.dto';
import { FarmMediaFilesService } from 'src/farm-media-files/farm-media-files.service';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { StallionServiceFee } from 'src/stallion-service-fees/entities/stallion-service-fee.entity';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { CreateFarmMemberDto } from 'src/member-farms/dto/create-farm-member.dto';
import { MemberFarmsService } from 'src/member-farms/member-farms.service';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { StallionPromotion } from 'src/stallion-promotions/entities/stallion-promotion.entity';
import { FarmMediaFileDto } from 'src/farm-media-files/dto/farm-media-file.dto';
import { UpdateFarmProfileDto } from './dto/update-farm-profile.dto';
import { FarmProfileImageService } from 'src/farm-profile-image/farm-profile-image.service';
import { MediaService } from 'src/media/media.service';
import { UpdateFarmOverviewDto } from './dto/update-farm-overview.dto';
import { FarmGalleryImageDto } from 'src/farm-gallery-images/dto/farm-gallery-image.dto';
import { FarmGalleryImageService } from 'src/farm-gallery-images/farm-gallery-image.service';
import { UpdateFarmGalleryDto } from './dto/update-farm-gallery.dto';
import { UpdateFarmMediaInfoDto } from './dto/update-farm-media-info';
import { FarmProfileImage } from 'src/farm-profile-image/entities/farm-profile-image.entity';
import { stallionsSortDto } from './dto/stallions-sort.dto';
import { DeleteFarmDto } from './dto/delete-farm.dto';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { PriceMinMaxOptionsDto } from './dto/price-min-max-options.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { MessageTemplatesService } from 'src/message-templates/message-templates.service';
import { StallionProfileImage } from 'src/stallion-profile-image/entities/stallion-profile-image.entity';
import { StallionGalleryImage } from 'src/stallion-gallery-images/entities/stallion-gallery-image.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { FarmAccessLevelsService } from 'src/farm-access-levels/farm-access-levels.service';
import { SearchStallionMatch } from 'src/search-stallion-match/entities/search-stallion-match.entity';
import { ActivityOptionDto } from './dto/activity-options.dto';
import { Runner } from 'src/runner/entities/runner.entity';
import { Member } from 'src/members/entities/member.entity';
import { MailService } from 'src/mail/mail.service';
import { CountryService } from 'src/country/service/country.service';
import { PreferedNotificationService } from 'src/prefered-notifications/prefered-notifications.service';
import { SearchMatchedMareDto } from 'src/breeder-report/dto/search-matched-mares.dto';
import { PageViewEntityType } from 'src/utils/constants/page-view';
import { PageViewService } from 'src/page-view/page-view.service';
import { AccessLevel } from 'src/farm-access-levels/access-levels.enum';
import { BreederStallionMatchActivityDto } from 'src/breeder-report/dto/breeder-stallion-match-activity.dto';
import { ActivityEntity } from 'src/activity-module/activity.entity';
import { HorsesService } from 'src/horses/horses.service';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import {
  notificationTemplates,
  notificationType,
} from 'src/utils/constants/notifications';
import { MemberSocialShareService } from 'src/member-social-share/member-social-share.service';
import { Cart } from 'src/carts/entities/cart.entity';
import { MemberFarmStallion } from 'src/member-farm-stallions/entities/member-farm-stallion.entity';
import { MemberInvitation } from 'src/member-invitations/entities/member-invitation.entity';
import { StatesService } from 'src/states/states.service';

@Injectable({ scope: Scope.REQUEST })
export class FarmsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Farm)
    private farmsRepository: Repository<Farm>,
    private farmLocationService: FarmLocationsService,
    private readonly farmMediaInfoService: FarmMediaInfoService,
    private readonly farmMediaFilesService: FarmMediaFilesService,
    private readonly fileUploadsService: FileUploadsService,
    private memberFarmsService: MemberFarmsService,
    private readonly farmProfileImageService: FarmProfileImageService,
    private readonly farmGalleryImageService: FarmGalleryImageService,
    private readonly mediaService: MediaService,
    private readonly commonUtilsService: CommonUtilsService,
    private readonly configService: ConfigService,
    private currenciesService: CurrenciesService,
    private notificationsService: NotificationsService,
    private messageTemplatesService: MessageTemplatesService,
    private farmAccessLevelsService: FarmAccessLevelsService,
    private mailService: MailService,
    private countryService: CountryService,
    private preferedNotificationService: PreferedNotificationService,
    private readonly pageViewService: PageViewService,
    private readonly horsesService: HorsesService,
    private readonly memberSocialShareService: MemberSocialShareService,
    private readonly statesService: StatesService,
    ) {}

  /* Create a New Farm */
  async create(createFarmDto: CreateFarmDto) {
    const member = this.request.user;
    const { farmName } = createFarmDto;
    if (member) {
      createFarmDto.createdBy = member['id'];
    }
    const farmResponse = await this.farmsRepository.save(
      this.farmsRepository.create(createFarmDto),
    );
    let locationData = new FarmLocationDto();
    locationData.countryId = createFarmDto.countryId;
    locationData.stateId = createFarmDto.stateId;
    locationData.farmId = farmResponse.id;
    await this.farmLocationService.create(locationData);

    //Set Record in Member Farm while Adding a Farm
    let farmAccessLevel = await this.farmAccessLevelsService.findOne(1);
    let farmMember = new CreateFarmMemberDto();
    farmMember.farmId = farmResponse.id;
    farmMember.memberId = farmResponse.createdBy;
    farmMember.isFamOwner = true;
    farmMember.accessLevelId = farmAccessLevel.id;
    farmMember.RoleId = farmAccessLevel.roleId;
    farmMember.createdBy = farmResponse.createdBy;
    await this.memberFarmsService.create(farmMember);
    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        notificationTemplates.farmCreatedUuid,
      );
    const messageText = messageTemplate.messageText.replace(
      '{farmName}',
      await this.commonUtilsService.toTitleCase(farmName),
    );
    const messageTitle = messageTemplate.messageTitle;
    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
      );

    const countryData = await this.countryService.findByCountryId(
      createFarmDto.countryId,
    );
    let stateData;
    if (createFarmDto.stateId) {
      stateData = await this.statesService.findOne(createFarmDto.stateId);
    }
    let farmLocation = '';
    if (stateData?.stateCode) {
      farmLocation = stateData?.stateCode + ', ';
    }
    farmLocation =
    farmLocation +
      (await this.commonUtilsService.toTitleCase(countryData.countryName));

    this.notificationsService.create({
      createdBy: createFarmDto.createdBy,
      messageTemplateId: messageTemplate?.id,
      notificationShortUrl: 'notificationShortUrl',
      recipientId: createFarmDto.createdBy,
      messageTitle,
      messageText,
      isRead: false,
      notificationType: preferedNotification?.notificationTypeId,
      farmid: farmResponse.id
    });

    const supperAdminRoleId = parseInt(process.env.SUPER_ADMIN_ROLE_ID);
    const admins = await getRepository(Member).find({
      roleId: supperAdminRoleId,
    });
    const messageTemplate2 =
      await this.messageTemplatesService.getMessageTemplateByUuid(
        notificationTemplates.farmCreatedConfirmationToAdminUuid,
      );
    const messageText2 = messageTemplate2.messageText.replace(
      '{farmName}',
      await this.commonUtilsService.toTitleCase(farmName),
    );
    const messageTitle2 = messageTemplate2.messageTitle;
    const actionUrl = messageTemplate2.linkAction.replace(
      '{farmId}',
      farmResponse.farmUuid,
    );
    const farmCreatedBy = await getRepository(Member).findOne({ id: farmResponse.createdBy });
    admins.forEach(async (adminUser) => {
      const preferedNotification =
        await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
          notificationType.SYSTEM_NOTIFICATIONS,
        );

      this.notificationsService.create({
        createdBy: createFarmDto.createdBy,
        messageTemplateId: messageTemplate2.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: adminUser.id,
        messageTitle: messageTitle2,
        messageText: messageText2,
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
        actionUrl,
      });
      let mailData = {
        to: adminUser.email,
        subject: 'Farm Recently Added!',
        text: '',
        template: '/new-farm-update-admin',
        context: {
          locationData: farmLocation,
          toName: await this.commonUtilsService.toTitleCase(adminUser.fullName),
          fromName: await this.commonUtilsService.toTitleCase(
            farmCreatedBy.fullName,
          ),
          farmName: await this.commonUtilsService.toTitleCase(farmResponse.farmName),
          farmPageUrl:
          `${this.configService.get('file.systemActivityAdminDomain')}/marketing/data/farm/${farmResponse.farmUuid}/filterbyfarmid`,
        },
      };
      this.mailService.sendMailCommon(mailData);
    });

    if (member) {
      if (messageTemplate) {
        if (messageTemplate.emailSms) {
          const recipient = await getRepository(Member).findOne({
            id: member['id'],
          });

          const preferedNotification =
            await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
              notificationType.SYSTEM_NOTIFICATIONS,
              member['id'],
            );

          if (!preferedNotification || preferedNotification.isActive) {
            let mailData = {
              to: recipient.email,
              subject: 'Congratulations! Your farm is now live on Stallion Match.',
              text: '',
              template: '/farm-added',
              context: {
                FarmUser: await this.commonUtilsService.toTitleCase(
                  recipient.fullName,
                ),
                FarmDashboard:
                  process.env.FRONTEND_DOMAIN +
                  '/' +
                  process.env.FRONTEND_APP_DASHBOARD_URI +
                  farmResponse.farmName +
                  '/' +
                  farmResponse.farmUuid,
                manageStallions:
                  process.env.FRONTEND_DOMAIN +
                  '/stallions/' +
                  farmResponse.farmName +
                  '/' +
                  farmResponse.farmUuid,
              },
            };
          }
        }
      }
    }

    return farmResponse;
  }
  /* Get Min - Max Stallion Fee Range */
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

    let queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'MIN(CEILING(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate))) minPrice, MAX(CEILING(stallionservicefee.fee * (destCurrency.rate/actCurrency.rate))) maxPrice',
      )
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .innerJoin('farm.stallions', 'stallion')
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
      );
    queryBuilder
      .andWhere('farm.isActive = :isActive', { isActive: true })
      .andWhere('stallion.isActive = :isActive', { isActive: true });
    let data = await queryBuilder.getRawOne();
    if (!data) {
      return {
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
  /* Search Farms */
  async findAll(searchOptionsDto: SearchOptionsDto): Promise<PageDto<Farm>> {
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

    let queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select('farm.id, COUNT(*) as stallionCount')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .leftJoin('farm.stallions', 'stallion')
      .andWhere('stallion.isActive = 1')
      .groupBy('farm.id');

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    let spQueryBuilder = getRepository(StallionPromotion)
      .createQueryBuilder('sp')
      .select(
        'sp.stallionId, sp.startDate, sp.endDate, CASE WHEN ((getutcdate() BETWEEN sp.startDate AND sp.endDate) AND (op.promotionId IS NOT NULL OR sp.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=sp.id',
      );

    let fPromotionQueryBuilder = getRepository(Stallion)
      .createQueryBuilder('t1')
      .select('t1.farmId, 1 as isPromoted, count(*) as promotedStallions')
      .innerJoin(
        '(' + spQueryBuilder.getQuery() + ')',
        't2',
        't2.stallionId=t1.id AND t2.isPromoted=1',
      )
      .groupBy('t1.farmId');

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

    const parentQuery = this.farmsRepository
      .createQueryBuilder('f')
      .select(
        'f.farmUuid as farmId, f.farmName as farmName,promotion.isPromoted as isPromoted, mediaUrl as profilePic',
      )
      .addSelect('c.id as countryId, c.countryName as countryName')
      .addSelect('s.stateName as stateName')
      .addSelect('rel.stallionCount as stallionCount')
      .addSelect('stallion.yearToStud as yearToStud')
      .addSelect('colour.id as colourId, colour.colourDominancy')
      .addSelect('stallionservicefee.fee as fee')
      .innerJoin('f.farmlocations', 'fl')
      .innerJoin('fl.country', 'c')
      .leftJoin('(' + queryBuilder.getQuery() + ')', 'rel', 'rel.id=f.id')
      .leftJoin('fl.state', 's')
      .leftJoin('f.stallions', 'stallion')
      .leftJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .leftJoin('horse.colour', 'colour')
      .leftJoin(
        '(' + fpiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=f.id',
      )
      .leftJoin(
        '(' + fPromotionQueryBuilder.getQuery() + ')',
        'promotion',
        'promotion.farmId=f.id',
      )
      .leftJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .leftJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .leftJoin('stallionservicefee.currency', 'currency')
      .leftJoin(
        'tblCurrencyRate',
        'actCurrency',
        'actCurrency.currencyCode=currency.currencyCode',
      )
      .leftJoin(
        'tblCurrencyRate',
        'destCurrency',
        "destCurrency.currencyCode='" + destinationCurrencyCode + "'",
      )
      .setParameters(queryBuilder.getParameters())
      .andWhere({ isActive: true });

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

      parentQuery
        .innerJoin(
          '(' + sireQueryBuilder.getQuery() + ')',
          'sire',
          'sireStallionId=stallion.id',
        )
        .setParameters(sireQueryBuilder.getParameters());
    }

    if (searchOptionsDto.grandSireId) {
      let grandSireIds = searchOptionsDto.grandSireId.split(',');
      let grandSireIdQb = getRepository(Horse)
        .createQueryBuilder('horse')
        .select('horse.id')
        .andWhere('horse.horseUuid IN (:...grandSireIds)', {
          grandSireIds: grandSireIds,
        })
        .andWhere('horse.sex=:msex', { msex: 'M' })
        .andWhere('horse.isVerified=:isVerified', { isVerified: 1 });

      let sireIdQb = getRepository(Horse)
        .createQueryBuilder('horse')
        .select('horse.id')
        .andWhere('horse.sireId IN(' + grandSireIdQb.getQuery() + ')')
        .andWhere('horse.sex=:ssex', { ssex: 'M' })
        .andWhere('horse.isVerified=:isVerified', { isVerified: 1 })
        .setParameters(grandSireIdQb.getParameters());

      let grandSireQueryBuilder = getRepository(Stallion)
        .createQueryBuilder('stt')
        .select('stt.id as grandSireStallionId')
        .innerJoin(
          'stt.horse',
          'horse',
          'horse.isVerified=1 AND horse.isActive=1',
        )
        .andWhere('horse.sireId IN(' + sireIdQb.getQuery() + ')')
        .andWhere('stt.isActive=:isActive', { isActive: 1 })
        .andWhere('stt.isVerified=:isVerified', { isVerified: 1 })
        .setParameters(sireIdQb.getParameters());

      parentQuery
        .innerJoin(
          '(' + grandSireQueryBuilder.getQuery() + ')',
          'grandsire',
          'grandSireStallionId=stallion.id',
        )
        .setParameters(grandSireQueryBuilder.getParameters());
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
          parentQuery.andWhere(
            'stallion.horseId NOT IN(:...ancestorHorsesList)',
            { ancestorHorsesList: ancestorHorsesList },
          );
        } else {
          parentQuery.andWhere('stallion.horseId IN(:...ancestorHorsesList)', {
            ancestorHorsesList: ancestorHorsesList,
          });
        }
      } else {
        if (!searchOptionsDto.isExcludeKeyAncestor) {
          queryBuilder.andWhere('stallion.horseId IS NULL');
        }
      }
    }

    if (searchOptionsDto.farmName) {
      if(searchOptionsDto.isFarmNameExactSearch){
        parentQuery.andWhere('f.farmName = :farmName', {
          farmName: searchOptionsDto.farmName,
        });
      }else{
        parentQuery.andWhere('f.farmName like :farmName', {
          farmName: `%${searchOptionsDto.farmName}%`,
        });
      }
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
        parentQuery.andWhere(
          '(fl.countryId  IN (:...countryList) OR fl.stateId IN (:...stateList))',
          { countryList: countryListData, stateList: stateListData },
        );
      }

      if (countryListData.length > 0 && stateListData.length == 0) {
        parentQuery.andWhere('fl.countryId  IN (:...countryList)', {
          countryList: countryListData,
        });
      }

      if (countryListData.length == 0 && stateListData.length > 0) {
        parentQuery.andWhere('fl.stateId  IN (:...stateList)', {
          stateList: stateListData,
        });
      }
    }

    if (searchOptionsDto.YearToStud) {
      parentQuery.andWhere('stallion.yearToStud = :yearToStud', {
        yearToStud: searchOptionsDto.YearToStud,
      });
    }

    if (searchOptionsDto.colour) {
      let colour = searchOptionsDto.colour.split(',');
      let colourList = colour.map((res) => parseInt(res));
      parentQuery.andWhere('colour.colourDominancyId IN (:...colour)', { colour: colourList });
    }

    if (searchOptionsDto.priceRange) {
      const priceRange = searchOptionsDto.priceRange;
      let priceList = priceRange.split('-');
      if (priceList.length === 2) {
        let minPrice = priceList[0];
        let maxPrice = priceList[1];
        let includeFeeDataNull = '';
        if (minPrice == '0') {
          includeFeeDataNull = ' OR stallionservicefee.fee IS NULL';
        }
        if (searchOptionsDto.isPrivateFee) {
          parentQuery.andWhere(
            '((((stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) <= :maxPrice AND stallionservicefee.isPrivateFee=0)' +
              includeFeeDataNull +
              ') OR stallionservicefee.isPrivateFee=1)',
            {
              minPrice,
              maxPrice,
            },
          );
        } else {
          parentQuery.andWhere(
            '(((stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) >= :minPrice AND (stallionservicefee.fee * (destCurrency.rate/actCurrency.rate)) <= :maxPrice AND stallionservicefee.isPrivateFee=0)' +
              includeFeeDataNull +
              ')',
            {
              minPrice,
              maxPrice,
            },
          );
        }
      }
    }
    if (!searchOptionsDto.priceRange && !searchOptionsDto.isPrivateFee) {
      parentQuery.andWhere('stallionservicefee.isPrivateFee = :isPrivateFee', {
        isPrivateFee: 0,
      });
    }

    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      switch (sortBy.toLowerCase()) {
        case 'promoted':
          parentQuery
            .addOrderBy('promotion.isPromoted', 'DESC')
            .addOrderBy('f.farmName', 'ASC');
          break;
        case 'alphabetical':
          parentQuery.addOrderBy('f.farmName', 'ASC');
          break;
        case 'stallion count':
          parentQuery
            .addOrderBy('rel.stallionCount', 'DESC')
            .addOrderBy('f.farmName', 'ASC');
          break;
        case 'recently updated':
          parentQuery.addOrderBy('f.modifiedOn', 'DESC');
          break;
        default:
          parentQuery
            .addOrderBy('promotion.isPromoted', 'DESC')
            .addOrderBy('f.farmName', 'ASC');
      }
    }

    const entities = await parentQuery.getRawMany();
    const keys = ['farmId'];
    let filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );
    const itemCount = filtered.length;
    let min = 0,
      max = 10000000;
    if (
      searchOptionsDto.colour ||
      searchOptionsDto.currency ||
      searchOptionsDto.farmName ||
      searchOptionsDto.location ||
      searchOptionsDto.priceRange ||
      searchOptionsDto.sireId ||
      searchOptionsDto.YearToStud ||
      searchOptionsDto.grandSireId ||
      searchOptionsDto.isExcludeKeyAncestor ||
      searchOptionsDto.isPrivateFee ||
      searchOptionsDto.keyAncestorId
    ) {
      min = Math.min(...filtered.map((item) => item.fee));
      max = Math.max(...filtered.map((item) => item.fee));
    }

    let result = filtered.slice(
      searchOptionsDto.skip,
      searchOptionsDto.skip + searchOptionsDto.limit,
    );

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });
    let finalResult = new PageDto(result, pageMetaDto);
    finalResult['priceRange'] = { max: max, min: min };
    return finalResult;
  }

  /* Get Farm Information */
  async findOne(fields) {
    return await this.farmsRepository.findOne({
      where: fields,
    });
  }

  /* Get Farm Information by farmId*/
  async findFarmUuid(farmId) {
    const record = await this.farmsRepository.findOne({
      id: farmId,
    });
    if (!record) {
      throw new UnprocessableEntityException('Farm not exist!');
    }
    return record;
  }

  /* Get Farm Information by FarmUuid*/
  async getFarmByUuid(farmUuid: string) {
    const record = await this.farmsRepository.findOne({ farmUuid });
    if (!record) {
      throw new UnprocessableEntityException('Farm not exist!');
    }
    return record;
  }

  /* Farm - Update Profile Data - Screen 1 */
  async profileUpdate(farmUuid: string, data: UpdateFarmProfileDto) {
    const member = this.request.user;
    let record = await this.getFarmByUuid(farmUuid);
    // Validate profileImage
    if (data?.profileImageuuid) {
      await this.setFarmProfilePic(record, data.profileImageuuid);
    }
    let locationData = new FarmLocationDto();
    locationData.countryId = data.countryId;
    locationData.stateId = data.stateId;
    delete data.countryId;
    delete data.stateId;
    delete data.profileImageuuid;
    const updateData = {
      ...data,
      modifiedBy: member['id'],
    };

    locationData.farmId = record.id;
    const farmLocation = await this.farmLocationService.findByFarmId(record.id);
    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
        member['id'],
      );
    const recipient = await getRepository(Member).findOne({ id: member['id'] });

    if (
      farmLocation.countryId != locationData.countryId ||
      farmLocation.stateId != locationData.stateId
    ) {
      const country = await this.countryService.findByCountryId(
        locationData.countryId,
      );
      let state;
      if (country && locationData.stateId) {
        const states = country.states;
        for (let st of states) {
          if (st.stateId == locationData.stateId) {
            state = st;
            break;
          }
        }
      }
      const recipient = await getRepository(Member).findOne({
        id: member['id'],
      });

      if (!preferedNotification || preferedNotification.isActive) {
        let mailData = {
          to: recipient.email,
          subject: 'Your farm address has been successfully updated.',
          text: '',
          template: '/farm-location',
          context: {
            FarmAdminName: await this.commonUtilsService.toTitleCase(
              recipient.fullName,
            ),
            FarmAddress: state?.stateName
              ? state?.stateName + ', ' + country?.countryName
              : country?.countryName,
            contactUs: process.env.FRONTEND_DOMAIN + '/contact-us',
          },
        };

        this.mailService.sendMailCommon(mailData);
      }
      await this.farmLocationService.update(record.id, locationData);
    }

    if (data?.farmName != record.farmName) {
      const messageTemplate =
        await this.messageTemplatesService.getMessageTemplateByUuid(
          notificationTemplates.updateMissingInformationProfile,
        );
      const messageText = messageTemplate.messageText;
      const messageTitle = messageTemplate.messageTitle;
      this.notificationsService.create({
        createdBy: member['id'],
        messageTemplateId: messageTemplate?.id,
        notificationShortUrl: 'notificationShortUrl',
        recipientId: member['id'],
        messageTitle,
        messageText,
        isRead: false,
        notificationType: preferedNotification?.notificationTypeId,
        farmid: record.id
      });

      if (messageTemplate) {
        if (messageTemplate.emailSms) {
          if (!preferedNotification || preferedNotification.isActive) {
            let mailData = {
              to: recipient.email,
              subject: 'Farm Name Changed',
              text: '',
              template: '/farm-name',
              context: {
                FarmAdminName: await this.commonUtilsService.toTitleCase(
                  recipient.fullName,
                ),
                FarmName: await this.commonUtilsService.toTitleCase(
                  data?.farmName,
                ),
                contactUs: process.env.FRONTEND_DOMAIN + '/contact-us',
              },
            };

            this.mailService.sendMailCommon(mailData);
          }
        }
      }
    }
    if (!preferedNotification || preferedNotification.isActive) {
      let farmName = data?.farmName ? data?.farmName : record?.farmName;
      let farmPageUrl = process.env.FRONTEND_DOMAIN + '/stud-farm/' + farmName + '/' + farmUuid;

      let mailData = {
        to: recipient.email,
        subject: 'Farm Updated',
        text: '',
        template: '/farm-updated',
        context: {
          farmAdminName: await this.commonUtilsService.toTitleCase(
            recipient.fullName,
          ),
          farmName: await this.commonUtilsService.toTitleCase(
            farmName 
          ),
          farmPageUrl: farmPageUrl,
        },
      };

      this.mailService.sendMailCommon(mailData);
    }
    await this.farmsRepository.update({ farmUuid: farmUuid }, updateData);
    return await this.getFarmDetails(farmUuid);
  }
  /* 'Farm - Add/Remove Gallery Data - Screen 2' */
  async galleryUpdate(farmUuid: string, data: UpdateFarmGalleryDto) {
    const member = this.request.user;

    const record = await this.getFarmByUuid(farmUuid);
    //Validate and Set GalleryImage
    if (data?.galleryImages) {
      await this.setGalleryImages(record.id, data.galleryImages);
      const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
        member['id'],
      );
      if (!preferedNotification || preferedNotification.isActive) {
        let farmName = record?.farmName;
        let farmPageUrl = process.env.FRONTEND_DOMAIN + '/stud-farm/' + farmName + '/' + farmUuid;
        const recipient = await getRepository(Member).findOne({
          id: member['id'],
        });
        let mailData = {
          to: recipient.email,
          subject: 'Farm Updated',
          text: '',
          template: '/farm-updated',
          context: {
            farmAdminName: await this.commonUtilsService.toTitleCase(
              recipient.fullName,
            ),
            farmName: await this.commonUtilsService.toTitleCase(
              farmName 
            ),
            farmPageUrl: farmPageUrl,
          },
        };
  
        this.mailService.sendMailCommon(mailData);
      }
    }
    return await this.getFarmDetails(farmUuid);
  }
  /* Farm - Update Overview Data - Screen 3 */
  async overviewUpdate(farmUuid: string, data: UpdateFarmOverviewDto) {
    const member = this.request.user;
    const record = await this.getFarmByUuid(farmUuid);
    let updateDto = {
      ...data,
      modifiedBy: member['id'],
    };

    await this.farmsRepository.update({ farmUuid: farmUuid }, updateDto);
    const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
        member['id'],
      );
    if (!preferedNotification || preferedNotification.isActive) {
      let farmName = record?.farmName;
      let farmPageUrl = process.env.FRONTEND_DOMAIN + '/stud-farm/' + farmName + '/' + farmUuid;
      const recipient = await getRepository(Member).findOne({
        id: member['id'],
      });
      let mailData = {
        to: recipient.email,
        subject: 'Farm Updated',
        text: '',
        template: '/farm-updated',
        context: {
          farmAdminName: await this.commonUtilsService.toTitleCase(
            recipient.fullName,
          ),
          farmName: await this.commonUtilsService.toTitleCase(
            farmName 
          ),
          farmPageUrl: farmPageUrl,
        },
      };

      this.mailService.sendMailCommon(mailData);
    }
    return await this.getFarmDetails(farmUuid);
  }

  /* Farm - Add/Remove/Update Media Data - Screen 4 */
  async mediaUpdate(farmUuid: string, data: UpdateFarmMediaInfoDto) {
    const record = await this.getFarmByUuid(farmUuid);
    const member = this.request.user;
    //Validate and Set Media
    if (data?.mediaInfos) {
      await this.setMediaInfos(record.id, data.mediaInfos);
      const preferedNotification =
      await this.preferedNotificationService.getPreferredNotificationByNotificationTypeCode(
        notificationType.SYSTEM_NOTIFICATIONS,
        member['id'],
      );
      if (!preferedNotification || preferedNotification.isActive) {
        let farmName = record?.farmName;
        let farmPageUrl = process.env.FRONTEND_DOMAIN + '/stud-farm/' + farmName + '/' + farmUuid;
        const recipient = await getRepository(Member).findOne({
          id: member['id'],
        });
        let mailData = {
          to: recipient.email,
          subject: 'Farm Updated',
          text: '',
          template: '/farm-updated',
          context: {
            farmAdminName: await this.commonUtilsService.toTitleCase(
              recipient.fullName,
            ),
            farmName: await this.commonUtilsService.toTitleCase(
              farmName 
            ),
            farmPageUrl: farmPageUrl,
          },
        };

        this.mailService.sendMailCommon(mailData);
      }
    }
    return await this.getFarmDetails(farmUuid);
  }
  /* Set Farm Profile Pic */
  async setFarmProfilePic(record: Farm, fileUuid: string) {
    // Check Profile pic already exist, if yes delete it from S3
    let profileImageData = await this.farmProfileImageService.findByFarmId(
      record.id,
    );
    if (profileImageData) {
      //Mark for Deletion - previous profile image
      await this.mediaService.markForDeletion(profileImageData.mediaId);
    }
    // Set Stallion Profile Image
    let mediaRecord = await this.mediaService.create(fileUuid);
    await this.farmProfileImageService.create({
      farmId: record.id,
      mediaId: mediaRecord.id,
    });
  }
  /* Set Gallery Images */
  async setGalleryImages(farmId: number, galleryImages: FarmGalleryImageDto[]) {
    let newImages = [];
    let deletedImages = [];
    await galleryImages.reduce(
      async (promise, galleryImage: FarmGalleryImageDto) => {
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
    let itemCount = await this.farmGalleryImageService.getImagesCountByFarmId(
      farmId,
    );
    itemCount = itemCount + newImages.length - deletedImages.length;
    if (itemCount > this.configService.get('file.maxLimitGalleryImage')) {
      throw new UnprocessableEntityException('Max limit reached!');
    }
    let farmGalleryImageService = this.farmGalleryImageService;
    await galleryImages.reduce(
      async (promise, galleryImage: FarmGalleryImageDto) => {
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
            await farmGalleryImageService.create(farmId, mediaRecord.id);
          }
        }
      },
      Promise.resolve(),
    );
  }
  /* Set Media Information */
  async setMediaInfos(farmId: number, mediaInfos: CreateMediaDto[]) {
    let createdMediaInfos = [];
    let updatedMediaInfos = [];
    let deletedMediaInfos = [];
    await mediaInfos.reduce(async (promise, mediaInfo: CreateMediaDto) => {
      await promise;
      if (mediaInfo?.mediaInfoId) {
        if (mediaInfo?.isDeleted) {
          //Delete MediaInfo
          deletedMediaInfos.push(mediaInfo);
        } else {
          //Update MediaInfo
          updatedMediaInfos.push(mediaInfo);
        }
      } else {
        //Create MediaInfo
        createdMediaInfos.push(mediaInfo);
      }
    }, Promise.resolve());

    //Delete MediaInfos
    await this.deleteMediaInfosFromFarm(farmId, deletedMediaInfos);
    //Update MediaInfos
    await this.updateMediaInfosToFarm(farmId, updatedMediaInfos);
    //Add New MediaInfos
    await this.addNewMediaInfosToFarm(farmId, createdMediaInfos);
  }
  /* Delete Media Information */
  async deleteMediaInfosFromFarm(
    farmId: number,
    deletedMediaInfos: CreateMediaDto[],
  ) {
    await deletedMediaInfos.reduce(
      async (promise, mediaInfo: CreateMediaDto) => {
        await promise;
        await mediaInfo?.mediaInfoFiles.reduce(
          async (promise, media: FarmMediaFileDto) => {
            await promise;
            if (media?.mediauuid && media.isDeleted) {
              // Delete Mediafile
              await this.mediaService.markForDeletionByMediaUuid(
                media.mediauuid,
              );
            }
          },
          Promise.resolve(),
        );
        await this.farmMediaInfoService.delete(farmId, mediaInfo.mediaInfoId);
      },
      Promise.resolve(),
    );
  }
  /* Update Media Information */
  async updateMediaInfosToFarm(
    farmId: number,
    updatedMediaInfos: CreateMediaDto[],
  ) {
    await updatedMediaInfos.reduce(
      async (promise, mediaInfo: CreateMediaDto) => {
        await promise;
        await mediaInfo?.mediaInfoFiles.reduce(
          async (promise, media: FarmMediaFileDto) => {
            await promise;
            if (media?.mediauuid) {
              if (media.isDeleted) {
                // Delete Mediafile
                await this.mediaService.markForDeletionByMediaUuid(
                  media.mediauuid,
                );
              } else {
                // Add Media file
                let mediaRecord = await this.mediaService.create(
                  media.mediauuid,
                );
                await this.farmMediaFilesService.create(
                  mediaInfo.mediaInfoId,
                  mediaRecord.id,
                );
              }
            }
          },
          Promise.resolve(),
        );
        let updateDto = new UpdateMediaDto();
        updateDto.title = mediaInfo.title;
        updateDto.description = mediaInfo.description;
        await this.farmMediaInfoService.update(
          farmId,
          mediaInfo.mediaInfoId,
          updateDto,
        );
      },
      Promise.resolve(),
    );
  }
  /* Add Media Information */
  async addNewMediaInfosToFarm(
    farmId: number,
    createdMediaInfos: CreateMediaDto[],
  ) {
    await createdMediaInfos.reduce(
      async (promise, mediaInfo: CreateMediaDto) => {
        await promise;
        let createMediaDto = new CreateMediaDto();
        createMediaDto.title = mediaInfo.title;
        createMediaDto.description = mediaInfo.description;
        let mediaInfoRecord = await this.farmMediaInfoService.create(
          farmId,
          createMediaDto,
        );
        await mediaInfo?.mediaInfoFiles.reduce(
          async (promise, media: FarmMediaFileDto) => {
            await promise;
            if (media?.mediauuid && !media.isDeleted) {
              // Add Media file
              let mediaRecord = await this.mediaService.create(media.mediauuid);
              await this.farmMediaFilesService.create(
                mediaInfoRecord.id,
                mediaRecord.id,
              );
            }
          },
          Promise.resolve(),
        );
      },
      Promise.resolve(),
    );
  }
  /* Remove a Farm */
  async remove(removeFarmDto: DeleteFarmDto) {
    const record = await this.farmsRepository.findOne({
      farmUuid: removeFarmDto.farmId,
    });
    if (!record) {
      throw new UnprocessableEntityException('Farm not exist!');
    }
    const member = this.request.user;
    // const response = await this.farmsRepository.update(
    //   { id: record.id },
    //   { isActive: false, modifiedBy: member['id'] },
    // );
    let memberFarmRecord = await this.memberFarmsService.findOne({
      farmId: record.id,
      memberId: member['id'],
    });

    const invitaions = await getRepository(MemberInvitation).findOne({
      farmId: record.id,
      memberId: member['id'],
    });
    if(invitaions){
      await getRepository(MemberInvitation).delete({
        id: invitaions.id,
      });
    }
    await getRepository(MemberFarmStallion).delete({
      memberFarmId: memberFarmRecord.id,
    });
    await getRepository(MemberFarm).delete({
      id: memberFarmRecord.id,
    });
    return {
      statusCode: 200,
      message: `This action removes a #${removeFarmDto.farmId} farm`,
      // data: response,
    };
  }
  /* Search Farm By Farm Name */
  async findFarmsByName(pageOptionsDto: FarmNameSearchDto) {
    const queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'farm.farmUuid as farmId, farm.farmName, country.countryName, state.stateName',
      )
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin('farmlocation.state', 'state');
    if (pageOptionsDto.farmName) {
      queryBuilder.andWhere('farm.farmName like :farmName', {
        farmName: `%${pageOptionsDto.farmName}%`,
      });
    }

    queryBuilder.andWhere({ isActive: true });

    if (pageOptionsDto.farmName) {
      const orderByCaseData =
        "CASE WHEN farm.farmName = '" +
        pageOptionsDto.farmName +
        "' THEN 0 WHEN farm.farmName LIKE '" +
        pageOptionsDto.farmName +
        "%' THEN 1 WHEN farm.farmName LIKE '%" +
        pageOptionsDto.farmName +
        "%' THEN 2  WHEN farm.farmName LIKE '%" +
        pageOptionsDto.farmName +
        "' THEN 3  ELSE 4 END";
      queryBuilder.orderBy(orderByCaseData, pageOptionsDto.order);
    } else {
      queryBuilder.orderBy('farm.farmName', 'ASC');
    }

    const entities = await queryBuilder.getRawMany();

    return entities;
  }
  /* Get All Farm Names */
  async getAllFarmNameAndIds() {
    const queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select('farm.farmUuid as farmId, farm.farmName');
    queryBuilder.andWhere({ isActive: true }).orderBy('farm.farmName', 'ASC');

    const entities = await queryBuilder.getRawMany();

    return entities;
  }
  /* Get All Farm Info By FarmId */
  async getFarmDetails(farmUuid: string) {
    const record = await this.farmsRepository.findOne({
      farmUuid,
      isActive: true,
    });
    if (!record) {
      throw new NotFoundException('Farm not found!');
    }

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

    const queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'farm.farmUuid as farmId,farm.id as id, farm.email, farm.website, mediaUrl as image, farm.url, farm.overview, farm.farmName as farmName, 0 as profileRating',
      )
      .addSelect(
        'country.id as countryId, country.countryCode as countryCode, country.countryName as countryName',
      )
      .addSelect('state.id as stateId, state.stateName as stateName')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin(
        '(' + fpiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=farm.id',
      )
      .leftJoin('farmlocation.state', 'state');

    queryBuilder
      .where('farm.farmUuid = :farmUuid', { farmUuid: farmUuid })
      .andWhere({ isActive: true });

    let farm = await queryBuilder.getRawOne();
    if (farm) {
      await this.getFarmProfileRating(farm);
      delete farm.id;
    }
    return farm;
  }
  /* Get  Farm Profile Rating By FarmId */
  async getFarmProfileRating(farm) {
    const fgImages = await this.farmGalleryImageService.getAllFarmGalleryImages(
      farm.id,
    );
    farm.profileRating = await this.calculateFarmRatingPercentage(
      farm,
      fgImages,
    );
  }
  /* Get  Farm Dynamic Overview  */
  async getFarmDynamicOverview(farm) {
    const finalData = await this.farmsRepository.manager.query(
      `EXEC proc_SMPFarmPageDynamicOveriew
      @pfarmid=@0`,
      [farm.id],
    );

    if (finalData.length) {
      return finalData[0];
    }
    return null;
  }
  /* Calculate  Farm Profile Rating Percentage */
  async calculateFarmRatingPercentage(farm, gImages) {
    const totalRequiredFields = this.configService.get(
      'file.totalFarmRequiredFields',
    );
    const completePercentage = this.configService.get(
      'file.completePercentage',
    );
    const { email, image, website, farmName, countryCode, overview } = farm;
    const farmData = { farmName, email, image, website, countryCode, overview };
    const farmMedia = await this.farmMediaInfoService.getAllMediaByFarmId(
      farm.id,
    );

    let farmMediaData = {};
    if (farmMedia && farmMedia.length) {
      farmMediaData = {
        mediaTitle: farmMedia[0]['title'],
        mediaDescription: farmMedia[0]['description'],
      };
    }
    let completedCount = 0;
    let profileRating = 0;

    for (let value of Object.values(farmData)) {
      if (value) completedCount++;
    }

    completedCount = completedCount + this.checkFarmTestimonial(farmMediaData);

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
  /* Calculate  Farm Testimonial Count */
  checkFarmTestimonial(testimonial) {
    let count = 0;
    for (let value of Object.values(testimonial)) {
      if (value) count++;
    }
    return count == 2 ? 1 : 0;
  }
  /* Get All Farm Gallery Images */
  async getAllGalleryImages(farmUuid: string) {
    const farm = await this.getFarmByUuid(farmUuid);
    return await this.farmGalleryImageService.getAllFarmGalleryImages(farm.id);
  }
  /* Get All Farm Media */
  async getAllFarmMediaByFarmId(farmUuid: string) {
    const farm = await this.getFarmByUuid(farmUuid);
    let records = await this.farmMediaInfoService.getAllMediaByFarmId(farm.id);
    return records;
  }
  /* Get All Farm Media by userId */
  async getAllFarmMediaByUserFavFarms() {
    let records =
      await this.farmMediaInfoService.getAllFarmMediaByUserFavFarms();
    return records;
  }
  /* Get All Farm members by FarmId */
  async getFarmMembers(farmId) {
    const record = await this.getFarmByUuid(farmId);
    let queryBuilder = getRepository(MemberFarm)
      .createQueryBuilder('memberfarm')
      .select(
        'member.memberuuid as memberId, member.fullName as memberName, memberfarm.isFamOwner as isFamOwner, member.email as memberEmail, memberfarm.accessLevelId as accessLevelId',
      )
      .innerJoin('memberfarm.member', 'member')
      .where('memberfarm.farmId = :farmId', { farmId: record.id });
    return await queryBuilder.getRawMany();
  }
  /* Farm - Profile Image Upload Initiation */
  async profileImageUpload(farmUuid: string, fileInfo: FileUploadUrlDto) {
    let record = await this.getFarmByUuid(farmUuid);
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
    const fileKey = `${this.configService.get('file.s3DirFarmProfileImage')}/${
      record.farmUuid
    }/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }
  /* 'Farm - Gallery Image Upload Initiation */
  async galleryImageUpload(farmUuid: string, fileInfo: FileUploadUrlDto) {
    let record = await this.getFarmByUuid(farmUuid);
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
    const fileKey = `${this.configService.get('file.s3DirFarmGalleryImage')}/${
      record.farmUuid
    }/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }
  /* Farm - Media Images/Videos Upload Initiation */
  async farmMediaFileUpload(farmUuid: string, fileInfo: FileUploadUrlDto) {
    const record = await this.getFarmByUuid(farmUuid);
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
    const fileKey = `${this.configService.get('file.s3DirFarmMediaImage')}/${
      record.farmUuid
    }/${fileInfo.fileuuid}/${fileInfo.fileName}`;
    return {
      url: await this.fileUploadsService.generatePutPresignedUrl(
        fileKey,
        fileMimeType,
      ),
    };
  }
  /* Get All Stallions By Farm */
  async getAllStallions(
    farmUuid: string,
    searchOptionsDto: stallionsSortDto,
  ): Promise<PageDto<Stallion>> {
    const member = this.request.user;
    let stallionIds = [];

    let stallionIdResult = await getRepository(MemberFarm)
      .createQueryBuilder('memberFarm')
      .select('memberfarmstallion.stallionId as stallionId')
      .innerJoin(
        'memberFarm.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .innerJoin('memberFarm.farmaccesslevel', 'farmaccesslevel')
      .innerJoin('memberFarm.memberfarmstallion', 'memberfarmstallion')
      .andWhere('farm.farmUuid = :farmUuid', { farmUuid: farmUuid })
      .andWhere('memberFarm.accessLevelId = :accessLevelId', {
        accessLevelId: AccessLevel.thirdparty,
      })
      .andWhere('memberFarm.memberId = :memberId', { memberId: member['id'] })
      .getRawMany();

    await stallionIdResult.reduce(async (promise, stallionItem) => {
      await promise;
      stallionIds.push(stallionItem.stallionId);
    }, Promise.resolve());

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

    let sgiQb = getRepository(StallionGalleryImage)
      .createQueryBuilder('sgiq')
      .select(
        'sgiq.stallionId as mediaStallionId, media.mediaUrl as mediaUrl, media.id',
      )
      .innerJoin(
        'sgiq.media',
        'media',
        'media.id=sgiq.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .innerJoin('sgiq.stallion', 'stallion', 'sgiq.stallionId = stallion.id')
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

    let ssmQueryBuilder = getRepository(SearchStallionMatch)
      .createQueryBuilder('sm')
      .select(
        'COUNT(sm.stallionId) as noofsearch,sm.stallionId as stallionId, s.farmId as farmId',
      )
      .innerJoin(
        'sm.stallion',
        's',
        's.id=sm.stallionId and s.isActive=1 and s.isVerified=1',
      )
      .innerJoin(
        's.farm',
        'f',
        'f.id=s.farmId and f.isActive=1 and f.isVerified=1',
      )
      .andWhere('f.farmUuid = :farmId', { farmId: farmUuid })
      .groupBy('sm.stallionId, s.farmId');

    let rcntQuery = getRepository(Runner)
      .createQueryBuilder('runer')
      .select('COUNT(runer.horseId) as totalWin, runer.horseId as wHorseId')
      .innerJoin('runer.positions', 'positions', 'positions.position = 1')
      .innerJoin('runer.races', 'races')
      .innerJoin('runer.horse', 'horse')
      .groupBy('runer.horseId');

    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    let cartProductQueryBuilder =  getRepository(Cart)
    .createQueryBuilder('cart')
    .select('cart.id as id,cart.cartSessionId as cartSessionId,cartProductItem.stallionPromotionId as stallionPromotionId,cartProductItem.stallionId as stallionIds')
    .innerJoin('cart.cartProduct', 'cartProduct','cartProduct.cartId=cart.id')
    .innerJoin('cartProduct.product', 'product','product.id=cartProduct.productId')
    .innerJoin('cartProduct.cartProductItem', 'cartProductItem','cartProductItem.cartProductId=cartProduct.id')
    .andWhere("product.productCode = 'PROMOTION_STALLION'")
    .andWhere('cartProductItem.stallionPromotionId IS NOT NULL')
  
    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select(
        'stallion.id, stallion.stallionUuid as stallionId, profileMediaUrl as profilePic, sgiMedia.mediaUrl as galleryImage, stallion.url, stallion.yearToStud, stallion.yearToRetired, stallion.overview, 0 as profileRating, stallion.height, stallion.isActive, stallion.createdOn',
      )
      .addSelect('horse.horseName, horse.yob')
      .addSelect('colour.colourDominancy as colourName')
      .addSelect('farm.farmName as farmName')
      .addSelect(
        'currency.id as currencyId,currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'stallionservicefee.fee as fee, stallionservicefee.feeYear as feeYear',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect(
        'stalliontestimonials.title as testimonialTitle,stalliontestimonials.company as testimonialTCompany,stalliontestimonials.description as testimonialTDescription',
      )
      .addSelect(
        'promotion.startDate as startDate, promotion.endDate as expiryDate, promotion.id as stallionPromotionId,promotion.promotedCount as promotedCount, CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted, promotion.isAutoRenew, promotion.stopPromotionCount as stopPromotionCount',
      )
      .addSelect(
        'cart.cartSessionId as cartId'
      )
      .addSelect(
        'nomination.noOfNominations as nominationPendingCount, nomination.startDate as nominationStartDate, nomination.endDate as nominationEndDate, CASE WHEN getutcdate() BETWEEN nomination.startDate AND nomination.endDate THEN 1 ELSE 0 END AS isNominated',
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
      .innerJoin('horse.colour', 'colour');

    if (
      searchOptionsDto.sortBy &&
      searchOptionsDto.sortBy.toLowerCase() === 'top performing'
    ) {
      queryBuilder.addSelect('wHorse.totalWin as totalWin');
    }

    queryBuilder
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
      .innerJoin('stallionlocation.country', 'country')
      .leftJoin('stallionlocation.state', 'state')
      .leftJoin('stallion.stalliontestimonials', 'stalliontestimonials')
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
      .leftJoin(
        '(' + cartProductQueryBuilder.getQuery() + ')',
        'cart',
        'stallionPromotionId=promotion.id',
      )  
      .leftJoin('tblMedia', 'sgiMedia', 'sgiMedia.id=sgi.sgiMediaId');

    if (searchOptionsDto.mostSearched) {
      queryBuilder.leftJoin(
        '(' + ssmQueryBuilder.getQuery() + ')',
        'ssm',
        'ssm.stallionId=stallion.id',
      );
    }
    if (stallionIds.length) {
      queryBuilder.andWhere('stallion.id IN (:...stallionIds)', {
        stallionIds: stallionIds,
      });
    }
    queryBuilder
      .andWhere('farm.farmUuid = :farmUuid', { farmUuid: farmUuid })
      .andWhere('stallion.isVerified = :isVerified', { isVerified: 1 })
      .andWhere('stallion.isActive = :isActive', { isActive: 1 });
    if (searchOptionsDto.mostSearched) {
      queryBuilder.setParameters(ssmQueryBuilder.getParameters());
    }
    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      queryBuilder.orderBy('horse.horseName', 'ASC');
      if (sortBy.toLowerCase() === 'year of birth') {
        queryBuilder.orderBy('horse.yob', 'ASC');
      }
      if (sortBy.toLowerCase() === 'top performing') {
        queryBuilder
          .leftJoin(
            '(' + rcntQuery.getQuery() + ')',
            'wHorse',
            'wHorseId=stallion.horseId',
          )
          .orderBy('totalWin', 'DESC');
      }
      if (sortBy.toLowerCase() === 'stud fee') {
        queryBuilder.orderBy('stallionservicefee.fee', 'DESC');
      }
      if (sortBy.toLowerCase() === 'status') {
        queryBuilder.orderBy('stallion.isActive', 'DESC');
      }
      if (sortBy.toLowerCase() === 'expiry') {
        queryBuilder.orderBy('promotion.endDate', 'DESC');
      }
    }
    if (searchOptionsDto.mostSearched) {
      queryBuilder
        .orderBy('ssm.noofsearch', 'DESC')
        .addOrderBy('horse.horseName', 'ASC');
    }

    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'this month') {
        queryBuilder.andWhere(
          'Year(stallion.createdOn) = :thisYear AND Month(stallion.createdOn) = :thisMonth',
          {
            thisYear: new Date().getFullYear(),
            thisMonth: new Date().getMonth() + 1,
          },
        );
      }
      if (filterBy.toLowerCase() === 'today') {
        queryBuilder.andWhere(
          'Year(stallion.createdOn) = :thisYear AND Month(stallion.createdOn) = :thisMonth AND Day(stallion.createdOn) = :thisDay ',
          {
            thisYear: new Date().getFullYear(),
            thisMonth: new Date().getMonth() + 1,
            thisDay: new Date().getDate(),
          },
        );
      }
      if (filterBy.toLowerCase() === 'this week') {
        var curr = new Date(); // get current date
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        var last = first + 6; // last day is the first day + 6

        var firstday = new Date(curr.setDate(first));
        var lastday = new Date(curr.setDate(last));
        queryBuilder.andWhere(
          'stallion.createdOn >= :fromDate AND stallion.createdOn <= :toDate',
          {
            fromDate: firstday,
            toDate: lastday,
          },
        );
      }
      if (filterBy.toLowerCase() === 'this year') {
        queryBuilder.andWhere('Year(stallion.createdOn) = :thisYear', {
          thisYear: new Date().getFullYear(),
        });
      }
      if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          queryBuilder.andWhere(
            'stallion.createdOn >= :fromDate AND stallion.createdOn <= :toDate',
            {
              fromDate: searchOptionsDto.fromDate,
              toDate: searchOptionsDto.toDate,
            },
          );
        }
      }
    }

    const entities = await queryBuilder.getRawMany();
    const sgImages = await sgiQb.getRawMany();

    const keys = ['stallionId'];
    const filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );

    await this.getProfileRating(filtered, sgImages);

    let result = filtered.slice(
      searchOptionsDto.skip,
      searchOptionsDto.skip + searchOptionsDto.limit,
    );
    const itemCount = filtered.length;
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(result, pageMetaDto);
  }
  /* Get All Stallions For a Farm - All users */
  async getAllFarmStallions(
    farmUuid: string,
    searchOptionsDto: stallionsSortDto,
  ): Promise<PageDto<Stallion>> {
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

    let sgiQb = getRepository(StallionGalleryImage)
      .createQueryBuilder('sgiq')
      .select(
        'sgiq.stallionId as mediaStallionId, media.mediaUrl as mediaUrl, media.id',
      )
      .innerJoin(
        'sgiq.media',
        'media',
        'media.id=sgiq.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .innerJoin('sgiq.stallion', 'stallion', 'sgiq.stallionId = stallion.id')
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

    let ssmQueryBuilder = getRepository(SearchStallionMatch)
      .createQueryBuilder('sm')
      .select(
        'COUNT(sm.stallionId) as noofsearch,sm.stallionId as stallionId, s.farmId as farmId',
      )
      .innerJoin(
        'sm.stallion',
        's',
        's.id=sm.stallionId and s.isActive=1 and s.isVerified=1',
      )
      .innerJoin(
        's.farm',
        'f',
        'f.id=s.farmId and f.isActive=1 and f.isVerified=1',
      )
      .andWhere('f.farmUuid = :farmId', { farmId: farmUuid })
      .groupBy('sm.stallionId, s.farmId');

    let rcntQuery = getRepository(Runner)
      .createQueryBuilder('runer')
      .select('COUNT(runer.horseId) as totalWin, runer.horseId as wHorseId')
      .innerJoin('runer.positions', 'positions', 'positions.position = 1')
      .innerJoin('runer.races', 'races')
      .innerJoin('runer.horse', 'horse')
      .groupBy('runer.horseId');

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
        'stallion.id, stallion.stallionUuid as stallionId, profileMediaUrl as profilePic, sgiMedia.mediaUrl as galleryImage, stallion.url, stallion.yearToStud, stallion.yearToRetired, stallion.overview, 0 as profileRating, stallion.height, stallion.isActive, stallion.createdOn',
      )
      .addSelect('horse.horseName, horse.yob')
      .addSelect('colour.colourDominancy as colourName')
      .addSelect('farm.farmName as farmName')
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .addSelect(
        'stallionservicefee.fee as fee, stallionservicefee.feeYear as feeYear',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect(
        'stalliontestimonials.title as testimonialTitle,stalliontestimonials.company as testimonialTCompany,stalliontestimonials.description as testimonialTDescription',
      )
      .addSelect(
        'promotion.startDate as startDate, promotion.endDate as expiryDate, promotion.id as stallionPromotionId,promotion.promotedCount as promotedCount, CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted, promotion.isAutoRenew, promotion.stopPromotionCount as stopPromotionCount',
      )
      .addSelect(
        'nomination.noOfNominations as nominationPendingCount, nomination.startDate as nominationStartDate, nomination.endDate as nominationEndDate, CASE WHEN getutcdate() BETWEEN nomination.startDate AND nomination.endDate THEN 1 ELSE 0 END AS isNominated',
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
      .innerJoin('horse.colour', 'colour');

    if (
      searchOptionsDto.sortBy &&
      searchOptionsDto.sortBy.toLowerCase() === 'top performing'
    ) {
      queryBuilder.addSelect('wHorse.totalWin as totalWin');
    }

    queryBuilder
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
      .innerJoin('stallionlocation.country', 'country')
      .leftJoin('stallionlocation.state', 'state')
      .leftJoin('stallion.stalliontestimonials', 'stalliontestimonials')
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .leftJoin('stallion.stallionnomination', 'nomination')
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=promotion.id',
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
      .leftJoin('tblMedia', 'sgiMedia', 'sgiMedia.id=sgi.sgiMediaId');

    if (searchOptionsDto.mostSearched) {
      queryBuilder.leftJoin(
        '(' + ssmQueryBuilder.getQuery() + ')',
        'ssm',
        'ssm.stallionId=stallion.id',
      );
    }
    queryBuilder
      .andWhere('farm.farmUuid = :farmUuid', { farmUuid: farmUuid })
      .andWhere('stallion.isVerified = :isVerified', { isVerified: 1 })
      .andWhere('stallion.isActive = :isActive', { isActive: 1 });
    if (searchOptionsDto.mostSearched) {
      queryBuilder.setParameters(ssmQueryBuilder.getParameters());
    }
    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      queryBuilder.orderBy('horse.horseName', 'ASC');
      if (sortBy.toLowerCase() === 'year of birth') {
        queryBuilder.orderBy('horse.yob', 'ASC');
      }
      if (sortBy.toLowerCase() === 'top performing') {
        queryBuilder
          .leftJoin(
            '(' + rcntQuery.getQuery() + ')',
            'wHorse',
            'wHorseId=stallion.horseId',
          )
          .orderBy('totalWin', 'DESC');
      }
      if (sortBy.toLowerCase() === 'stud fee') {
        queryBuilder.orderBy('stallionservicefee.fee', 'DESC');
      }
      if (sortBy.toLowerCase() === 'status') {
        queryBuilder.orderBy('stallion.isActive', 'DESC');
      }
      if (sortBy.toLowerCase() === 'expiry') {
        queryBuilder.orderBy('promotion.endDate', 'DESC');
      }
    }
    if (searchOptionsDto.mostSearched) {
      queryBuilder
        .orderBy('ssm.noofsearch', 'DESC')
        .addOrderBy('horse.horseName', 'ASC');
    }

    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'this month') {
        queryBuilder.andWhere(
          'Year(stallion.createdOn) = :thisYear AND Month(stallion.createdOn) = :thisMonth',
          {
            thisYear: new Date().getFullYear(),
            thisMonth: new Date().getMonth() + 1,
          },
        );
      }
      if (filterBy.toLowerCase() === 'today') {
        queryBuilder.andWhere(
          'Year(stallion.createdOn) = :thisYear AND Month(stallion.createdOn) = :thisMonth AND Day(stallion.createdOn) = :thisDay ',
          {
            thisYear: new Date().getFullYear(),
            thisMonth: new Date().getMonth() + 1,
            thisDay: new Date().getDate(),
          },
        );
      }
      if (filterBy.toLowerCase() === 'this week') {
        var curr = new Date(); // get current date
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        var last = first + 6; // last day is the first day + 6

        var firstday = new Date(curr.setDate(first));
        var lastday = new Date(curr.setDate(last));
        queryBuilder.andWhere(
          'stallion.createdOn >= :fromDate AND stallion.createdOn <= :toDate',
          {
            fromDate: firstday,
            toDate: lastday,
          },
        );
      }
      if (filterBy.toLowerCase() === 'this year') {
        queryBuilder.andWhere('Year(stallion.createdOn) = :thisYear', {
          thisYear: new Date().getFullYear(),
        });
      }
      if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          queryBuilder.andWhere(
            'stallion.createdOn >= :fromDate AND stallion.createdOn <= :toDate',
            {
              fromDate: searchOptionsDto.fromDate,
              toDate: searchOptionsDto.toDate,
            },
          );
        }
      }
    }

    const entities = await queryBuilder.getRawMany();
    const sgImages = await sgiQb.getRawMany();

    const keys = ['stallionId'];
    const filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );

    await this.getProfileRating(filtered, sgImages);

    let result = filtered.slice(
      searchOptionsDto.skip,
      searchOptionsDto.skip + searchOptionsDto.limit,
    );
    const itemCount = filtered.length;
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(result, pageMetaDto);
  }
  /* Get Stallion Profile Rating */
  async getProfileRating(list, sgImages) {
    for (let i = 0; i < list.length; i++) {
      let gImages = sgImages.filter((e) => e.mediaStallionId == list[i].id);

      list[i].profileRating = this.calculateStallionPtofileRatingPercentage(
        list[i],
        gImages,
      );

      this.deleteExtraFiels(list[i]);
    }
  }
  /* Calculate stallion Profile Rating Percentage */
  calculateStallionPtofileRatingPercentage(stallion, gImages) {
    const totalRequiredFields = this.configService.get(
      'file.totalRequiredFields',
    );
    const completePercentage = this.configService.get(
      'file.completePercentage',
    );
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
  /* Get Stallion testimonial count */
  checkTestimonial(testimonial) {
    let count = 0;
    for (let value of Object.values(testimonial)) {
      if (value) count++;
    }
    return count == 3 ? 1 : 0;
  }
  /* To Delete extra fields from stallion Profile Rating  */
  deleteExtraFiels(data) {
    delete data['testimonialTitle'];
    delete data['testimonialTCompany'];
    delete data['testimonialTDescription'];
  }
  /* Get All Stallions Without Pagination */
  async getAllStallionsWithoutPaging(farmUuid: string) {
    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

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
      .select('stallion.stallionUuid as stallionId')
      .addSelect('horse.horseName as stallionName')
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .addSelect(
        'stallionservicefee.fee as studFee, stallionservicefee.currencyId as currencyId',
      )
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
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
      .leftJoin(
        '(' + studFeeQueryBuilder.getQuery() + ')',
        'stud',
        'feeStallionId=stallion.id',
      )
      .leftJoin(
        'stallion.stallionservicefee',
        'stallionservicefee',
        'stallionservicefee.id=studFeeId',
      )
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .leftJoin('stallionservicefee.currency', 'currency')
      .leftJoin('stallion.stallionnomination', 'nomination')
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=promotion.id',
      )
      .andWhere('farm.farmUuid = :farmUuid', { farmUuid: farmUuid });
    queryBuilder.andWhere('stallion.isActive = :isActive', { isActive: true });
    queryBuilder.orderBy('horse.horseName', 'ASC');
    const keys = ['stallionId'];
    let entities = await queryBuilder.getRawMany();
    const filtered = entities.filter(
      (
        (s) => (o) =>
          ((k) => !s.has(k) && s.add(k))(keys.map((k) => o[k]).join('|'))
      )(new Set()),
    );

    return filtered;
  }

  /* Get All My Stallions */
  async getAllMyStallions() {
    const member = this.request.user;
    let myFarms = await this.memberFarmsService.getMemberFarmsByMemberId({
      memberId: member['id'],
    });
    let farmUuids = [];
    if (myFarms && myFarms.length > 0) {
      myFarms.forEach((item) => {
        farmUuids.push(item.farmId);
      });
      const queryBuilder = await getRepository(Stallion)
        .createQueryBuilder('stallion')
        .select(
          'stallion.stallionUuid as stallionId, horse.horseName as stallionName',
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
        .andWhere('farm.farmUuid IN (:...farmUuids)', { farmUuids: farmUuids })
        .andWhere('stallion.isActive = :isActive', { isActive: true })
        .orderBy('horse.horseName', 'ASC')
        .getRawMany();

      return queryBuilder;
    } else {
      return [];
    }
  }
  /* Get All Farm Analytics */
  async getFarmAnalytics(searchOptionsDto: BreederStallionMatchActivityDto) {
    const queryBuilder = getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id as farmId')
      .andWhere('farm.farmUuid = :farmUuid', {
        farmUuid: searchOptionsDto.farmId,
      });
    const entities = await queryBuilder.getRawOne();
    if (!entities) {
      throw new NotFoundException('Farm not found');
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
      if (filterBy.toLowerCase() === 'last month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth() - 1, 1);
        toDate = new Date(curr.getFullYear(), curr.getMonth(), 0);
      }
      if (filterBy.toLowerCase() === 'last year') {
        let lastYear = curr.getFullYear() - 1;
        fromDate = new Date(lastYear, 0, 1);
        toDate = new Date(lastYear, 11, 31);
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
    const finalData = await this.farmsRepository.manager.query(
      `EXEC proc_SMPFarmDashboardAnalytics
      @pFarmId=@0,
      @paramDate1=@1,
      @paramDate2=@2`,
      [entities.farmId, fromDate, toDate],
    );

    return finalData;
  }
  /* Get All Promoted Stallions By Farm */
  async findPromotedStallions(farmId) {
    let orderProductQueryBuilder = getRepository(OrderProduct)
      .createQueryBuilder('op')
      .select('orderProductItem.stallionPromotionId promotionId')
      .innerJoin('op.product', 'product')
      .innerJoin('op.orderProductItem', 'orderProductItem')
      .andWhere('op.orderStatusId = 1')
      .andWhere("product.productCode = 'PROMOTION_STALLION'");

    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.stallionUuid as stallionId')
      .addSelect('horse.horseName as horseName')
      .addSelect(
        'CASE WHEN ((getutcdate() BETWEEN promotion.startDate AND promotion.endDate) AND (op.promotionId IS NOT NULL OR promotion.isAdminPromoted=1)) THEN 1 ELSE 0 END AS isPromoted',
      )
      .innerJoin(
        'stallion.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .innerJoin(
        'stallion.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .leftJoin('stallion.stallionpromotion', 'promotion')
      .leftJoin(
        '(' + orderProductQueryBuilder.getQuery() + ')',
        'op',
        'promotionId=promotion.id',
      )
      .andWhere('farm.farmUuid = :farmId', { farmId: farmId })
      .andWhere(
        'CASE WHEN getutcdate() BETWEEN promotion.startDate AND promotion.endDate THEN 1 ELSE 0 END = 1',
      );

    const entities = await queryBuilder.getRawMany();

    return entities;
  }
  /* Get  Farm Logo By FarmID  */
  async getFarmLogoByFarmId(farmId: number) {
    const record = await this.farmsRepository.findOne({
      id: farmId,
      isActive: true,
    });
    if (!record) {
      throw new NotFoundException('Farm not found!');
    }
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

    const queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select('farm.farmUuid as farmId, farm.farmName, mediaUrl as farmLogo')
      .leftJoin(
        '(' + fpiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=farm.id',
      );

    queryBuilder
      .where('farm.id = :farmId', { farmId: farmId })
      .andWhere({ isActive: true });

    return await queryBuilder.getRawOne();
  }
  /* Linked Farms list by stallion */
  async linkedFarms(stallionId) {
    const stallionRes = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.horseId as horseId')
      .andWhere('stallion.stallionUuid = :stallionId', {
        stallionId: stallionId,
      });
    const result = await stallionRes.getRawMany();
    let queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select('farm.farmUuid as farmId, farm.farmName as farmName')
      .leftJoin('farm.stallions', 'stallion')
      .leftJoin('stallion.horse', 'horse')
      .andWhere('horse.id = :horseId', { horseId: result[0].horseId });
    const entities = await queryBuilder.getRawMany();
    return entities;
  }
  /* Get Farm Activity */
  async getFarmActivity(searchOption: ActivityOptionDto) {
    let spiQueryBuilder = getRepository(FarmProfileImage)
      .createQueryBuilder('fpi')
      .select('fpi.farmId as mediaFarmId, media.mediaUrl as profileMediaUrl')
      .innerJoin(
        'fpi.media',
        'media',
        'media.id=fpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    const queryBuilder = getRepository(ActivityEntity)
      .createQueryBuilder('farmActivity')
      .select(
        'DISTINCT(farmActivity.id) as farmActivityId, farmActivity.additionalInfo as messageText, profileMediaUrl as profilePic, farmActivity.createdOn as createdOn',
      )
      .addSelect('farm.farmUuid as farmId, farm.farmName as farmName')
      .innerJoin('farmActivity.farm', 'farm')
      .leftJoin(
        '(' + spiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=farm.id',
      );

    if (searchOption.countryId) {
      queryBuilder
        .innerJoin('farm.farmlocations', 'farmlocations')
        .andWhere('farmlocations.countryId = :countryId', {
          countryId: searchOption.countryId,
        });
    }

    if (searchOption.fromDate && searchOption.toDate) {
      queryBuilder.andWhere(
        'farmActivity.createdOn BETWEEN :fromDate AND :toDate',
        {
          fromDate: await this.commonUtilsService.setHoursZero(
            searchOption.fromDate,
          ),
          toDate: await this.commonUtilsService.setToMidNight(
            searchOption.toDate,
          ),
        },
      );
    } else {
      var fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      queryBuilder.andWhere(
        'farmActivity.createdOn BETWEEN :fromDate AND :toDate',
        {
          fromDate: await this.commonUtilsService.setHoursZero(fromDate),
          toDate: await this.commonUtilsService.setToMidNight(new Date()),
        },
      );
    }
    queryBuilder
    .andWhere('farmActivity.additionalInfo NOT LIKE :additionalInfo', {
      additionalInfo: '%Completed a SM search%',
    });
    queryBuilder.orderBy('farmActivity.createdOn', searchOption.order);
    queryBuilder.limit(searchOption.limit).skip(searchOption.skip);

    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /* Get Farm Overview By Id */
  async findFarmOverview(farmId: string) {
    const farm = await this.findOne({ farmUuid: farmId });
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }
    let overview: any = farm?.overview;
    if (!overview) {
      overview = await this.getFarmDynamicOverview(farm);
    }
    return overview;
  }
  /* Get Matched Mares */
  async findMatchedMares(searchOptionsDto: SearchMatchedMareDto, isPagination) {
    const queryBuilder = getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id as farmId')
      .andWhere('farm.farmUuid = :farmUuid', {
        farmUuid: searchOptionsDto.farmId,
      });
    const entities = await queryBuilder.getRawOne();
    if (!entities) {
      throw new NotFoundException('Farm not found');
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
      if (filterBy.toLowerCase() === 'last month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth() - 1, 1);
        toDate = new Date(curr.getFullYear(), curr.getMonth(), 0);
      }
      if (filterBy.toLowerCase() === 'last year') {
        let lastYear = curr.getFullYear() - 1;
        fromDate = new Date(lastYear, 0, 1);
        toDate = new Date(lastYear, 11, 31);
      }
      if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
        }
      }
    }

    if (isPagination) {
      const finalData = await this.farmsRepository.manager.query(
        `EXEC proc_SMPBreederMatchMareStallionMatch
      @pfarmid=@0,
      @pFromDate=@1,
      @pToDate=@2,
      @IsPagination=@3,
      @PageNumber=@4,
      @RowsOfPage=@5`,
        [
          entities.farmId,
          fromDate,
          toDate,
          1,
          searchOptionsDto.page,
          searchOptionsDto.limit,
        ],
      );
      let totalRecCnt = 0;
      if (finalData && finalData.length > 0)
        totalRecCnt = finalData[0].TotRecordCount;
      return this.commonUtilsService.paginateForProc(
        finalData,
        searchOptionsDto.page,
        searchOptionsDto.limit,
        totalRecCnt,
      );
    } else {
      const finalData = await this.farmsRepository.manager.query(
        `EXEC proc_SMPBreederMatchMareStallionMatch
        @pfarmid=@0,
        @pFromDate=@1,
        @pToDate=@2,
        @IsPagination=@3`,
        [entities.farmId, fromDate, toDate, 0],
      );
      return finalData;
    }
  }
  /* Save Farm page view count */
  async farmPageView(farmId: string, referrer) {
    const record = await this.getFarmByUuid(farmId);
    await this.pageViewService.createInit(
      record.id,
      PageViewEntityType.FARM,
      referrer,
    );
  }
  /* Save stallion page social share count */
  async farmSocialShare(id: string, socialShare) {
    const record = await this.getFarmByUuid(id);
    await this.memberSocialShareService.createInit(
      record.id,
      PageViewEntityType.FARM,
      socialShare,
    );
  }

  /* Get Farms by Country And States */
  async getFarmByCountry(location: string) {
    let stallionSubQueryBuilder = await getRepository(Farm)
      .createQueryBuilder('farm')
      .select('farm.id as farmId, COUNT(stallions.farmId) as stallionCount')
      .leftJoin('farm.stallions', 'stallions')
      .groupBy('farm.id');

    let queryBuilder = this.farmsRepository
      .createQueryBuilder('farm')
      .select(
        'farm.farmName as farmName,farmlocations.countryId,farmlocations.stateId,stallion.stallionCount',
      )
      .addSelect(
        'farm.farmUuid as farmId, CASE WHEN stallionCount > 0 THEN 1 ELSE 0 END as isStallionExist',
      )
      .innerJoin(
        '(' + stallionSubQueryBuilder.getQuery() + ')',
        'stallion',
        'stallion.farmId=farm.id',
      )
      .innerJoin('farm.farmlocations', 'farmlocations');
    if (location) {
      const locationsList = location.split('|');
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
          '(farmlocations.countryId  IN (:...countryList) OR farmlocations.stateId IN (:...stateList))',
          { countryList: countryListData, stateList: stateListData },
        );
      }

      if (countryListData.length > 0 && stateListData.length == 0) {
        queryBuilder.andWhere('farmlocations.countryId  IN (:...countryList)', {
          countryList: countryListData,
        });
      }

      if (countryListData.length == 0 && stateListData.length > 0) {
        queryBuilder.andWhere('farmlocations.stateId  IN (:...stateList)', {
          stateList: stateListData,
        });
      }
    }
    const entities = await queryBuilder.getRawMany();
    return entities;
  }
  /* Get All Stallions by Farm */
  async getAllStallionIdsByFarmId(farmId: string) {
    const queryBuilder = getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as stallionId')
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
      .andWhere('farm.farmUuid = :farmUuid', { farmUuid: farmId })
      .andWhere('stallion.isVerified = :isVerified', { isVerified: 1 })
      .andWhere('stallion.isActive = :isActive', { isActive: 1 });

    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /* Get All Farm Locations */
  async getAllFarmLocations() {
    let data = await this.farmsRepository.manager.query(
      `EXEC proc_SMPGetFarmLocations`,
    );
    return await this.commonUtilsService.getCountryStatesFromFilter(data);
  }

  /* Get Stallion By FarmId With Inbreedings */
  async getAllStallionsWithInbreeding(farmId: string) {
    await this.getFarmByUuid(farmId);
    const data = await this.farmsRepository.manager.query(
      `EXEC procGetStallionByfarmId @pFarmId=@0`,
      [farmId],
    );

    return data;
  }
}
