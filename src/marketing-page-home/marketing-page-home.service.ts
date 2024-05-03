import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Horse } from 'src/horses/entities/horse.entity';
import { MarketingAdditonInfoService } from 'src/marketing-addition-info/marketing-addition-info.service';
import { MarketingMedia } from 'src/marketing-media/entities/marketing-media.entity';
import { Runner } from 'src/runner/entities/runner.entity';
import { getRepository } from 'typeorm';
import { MarketingPageHomeData } from './entities/marketing-page-home.entity';
import { MarketingPageSection } from './entities/marketing-page-section.entity';
import { MarketingPage } from './entities/marketing-page.entity';
import { MarketingTilePermissions } from './entities/marketing-tile-permissions.entity';

@Injectable()
export class MarketingPageHomeService {
  constructor(
    private readonly marketingAdditonInfoService: MarketingAdditonInfoService,
  ) {}

  /* Get the marketing page data data like heading, hero image, banner1 and banner2 etc. with page(Home, stalliom match, Trends, Reports overview) uuid */
  async findByUuId(marketingPageUuid: string, options = {}) {
    const page = await this.getPageByUuid(marketingPageUuid);

    let mmQueryBuilder = getRepository(MarketingMedia)
      .createQueryBuilder('mm')
      .select(
        'mm.marketingPageId as marketingPageId, mm.marketingPageSectionId as marketingPageSectionId, media.mediaUrl as mediaUrl',
      )
      .innerJoin(
        'mm.media',
        'media',
        'media.id=mm.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    let marktQueryBuilder = getRepository(MarketingPageHomeData)
      .createQueryBuilder('mrktPageHomeData')
      .select(
        'mrktPageHomeData.id as id, mrktPageHomeData.marketingPageId as marketingPageId, mrktPageHomeData.marketingPageSectionId as marketingPageSectionId, mrktPageHomeData.marketingPageTitle as marketingPageTitle, mrktPageHomeData.marketingPageDescription as marketingPageDescription, mrktPageHomeData.marketingPageDescription1 as bannerDescription1, mrktPageHomeData.marketingPageDescription2 as bannerDescription2, mrktPageHomeData.marketingPageDescription3 as bannerDescription3, mrktPageHomeData.marketingPageButtonText as buttonText, mrktPageHomeData.marketingPageButtonUrl as buttonUrl, mrktPageHomeData.marketingPageTarget as marketingPageTarget, mrktPageHomeData.marketingPagePlaceholder as marketingPagePlaceholder, mrktPageHomeData.isRegistered as isRegistered, mrktPageHomeData.isAnonymous as isAnonymous,mmImage.mediaUrl as bgImage',
      )
      .addSelect(
        'marktPageSec.marketingPageSectionName as sectionName,marktPageSec.marketingPageSectionType as sectionType,marktPageSec.marketingPageSectionUuid as marketingPageSectionUuid',
      )
      .innerJoin('mrktPageHomeData.marketingPageSection', 'marktPageSec')
      .leftJoin(
        '(' + mmQueryBuilder.getQuery() + ')',
        'mmImage',
        'mmImage.marketingPageId=mrktPageHomeData.marketingPageId AND mmImage.marketingPageSectionId=mrktPageHomeData.marketingPageSectionId',
      )
      .andWhere('mrktPageHomeData.marketingPageId = :marketingPageId', {
        marketingPageId: page['marketingPageId'],
      });

    const entities = await marktQueryBuilder.getRawMany();

    if (!entities || entities.length == 0) {
      const query = getRepository(MarketingPageSection)
        .createQueryBuilder('mrktPageSec')
        .select(
          'mrktPageSec.id as marketingPageSectionId, mrktPageSec.marketingPageId as marketingPageId, mrktPageSec.marketingPageSectionName as sectionName, mrktPageSec.marketingPageSectionType as sectionType, mrktPageSec.marketingPageSectionUuid as marketingPageSectionUuid',
        )
        .andWhere('mrktPageSec.marketingPageId = :marketingPageId', {
          marketingPageId: page['marketingPageId'],
        });

      const data = await query.getRawMany();
      return this.formatResponse(page, data, options);
    }
    return this.formatResponse(page, entities, options);
  }

  /*Get a page by uuid */
  async getPageByUuid(marketingPageUuid: string) {
    let pageQueryBuilder = getRepository(MarketingPage)
      .createQueryBuilder('mrktPage')
      .select(
        'mrktPage.id as marketingPageId, mrktPage.marketingPageName as marketingPageName, mrktPage.pagePrefix as pagePrefix',
      )
      .andWhere('mrktPage.marketingPageUuid = :marketingPageUuid', {
        marketingPageUuid: marketingPageUuid,
      });

    const page = await pageQueryBuilder.getRawOne();
    if (!page) {
      throw new NotFoundException('Page not found!');
    }

    return page;
  }

  /* Formate for response - page section like heading, hero image, banner1, banner2, header and footer etc. */
  async formatResponse(page, secList, options) {
    let newFormat = {};

    for (let i = 0; i < secList.length; i++) {
      const secData = secList[i];
      if (secData.sectionType === 'mainHeading') {
        newFormat['mainHeading'] = this.formatMainHeading(
          page['pagePrefix'],
          secData,
        );
      } else if (secData.sectionType === 'heroImage') {
        newFormat['heroImage'] = this.formatHeroImage(
          page['pagePrefix'],
          secData,
        );
      } else if (secData.sectionType === 'banner1') {
        newFormat['banner1'] = this.formatBanner1(page['pagePrefix'], secData);
      } else if (secData.sectionType === 'banner2') {
        newFormat['banner2'] = this.formatBanner2(secData);
      } else if (secData.sectionType === 'headerBannerRegistered') {
        newFormat['headerBannerRegistered'] =
          this.formatHeaderFooterBannerRegistered(secData);
      } else if (secData.sectionType === 'footerBannerRegistered') {
        newFormat['footerBannerRegistered'] =
          this.formatHeaderFooterBannerRegistered(secData);
      } else if (secData.sectionType === 'headerBanner') {
        newFormat['headerBanner'] = this.formatHeaderFooterBanner(
          secData,
        );
      } else if (secData.sectionType === 'footerBanner') {
        newFormat['footerBanner'] = this.formatHeaderFooterBanner(
          secData,
        );
      } else if (secData.sectionType === 'reportsOverview') {
        newFormat['overview'] = await this.getAdditonInfo(
          page['marketingPageId'],
          'overview',
          options,
        );
      } else if (secData.sectionType === 'racehorse') {
        newFormat['racehorse'] = await this.getAdditonInfo(
          page['marketingPageId'],
          secData.sectionType,
          options,
        );
      }
    }

    if (
      page['pagePrefix'] === 'page_reports_overview' ||
      page['pagePrefix'] === 'racehorse_page'
    ) {
      return newFormat;
    }

    if (page['pagePrefix'] === 'page_stallion_match_farm') {
      newFormat['clientLogos'] = await this.getAdditonInfo(
        page['marketingPageId'],
        'clientLogos',
        options,
      );
      newFormat['freePricingTile'] = await this.getAdditonInfo(
        page['marketingPageId'],
        'freePricingTile',
        options,
      );
      newFormat['promotedPricingTile'] = await this.getAdditonInfo(
        page['marketingPageId'],
        'promotedPricingTile',
        options,
      );
    }

    if (page['pagePrefix'] === 'page_trends') {
      newFormat['tilePermissions'] = await this.getAdditonInfo(
        page['marketingPageId'],
        'tilePermissions',
        options,
      );
    }

    if (page['pagePrefix'] !== 'page_trends') {
      newFormat['testimonials'] = await this.getAdditonInfo(
        page['marketingPageId'],
        'testimonial',
        options,
      );
      newFormat['carasouls'] = await this.getAdditonInfo(
        page['marketingPageId'],
        'carousel',
        options,
      );
    }

    return newFormat;
  }

  /* Formate response for page section mail heading */
  formatMainHeading(pagePrefix, mainHding) {
    let mainHeadingRes = {
      sectionName: mainHding.sectionName,
      marketingPageSectionUuid: mainHding.marketingPageSectionUuid,
      title: mainHding.marketingPageTitle ? mainHding.marketingPageTitle : '',
      description: mainHding.marketingPageDescription
        ? mainHding.marketingPageDescription
        : '',
      bgImage: mainHding.bgImage ? mainHding.bgImage : '',
    };
    if (pagePrefix === 'page_stallion_match_farm') {
      mainHeadingRes['emailAddress'] = mainHding.marketingPagePlaceholder
        ? mainHding.marketingPagePlaceholder
        : '';
      mainHeadingRes['buttonTarget'] = mainHding.marketingPageTarget
        ? mainHding.marketingPageTarget
        : '';
    }

    return mainHeadingRes;
  }

  /* Formate response for page section Hero image */
  formatHeroImage(pagePrefix, heroImg) {
    let heroImageRes = {
      sectionName: heroImg.sectionName,
      marketingPageSectionUuid: heroImg.marketingPageSectionUuid,
    };
    if (pagePrefix === 'page_home') {
      heroImageRes['title'] = heroImg.marketingPageTitle
        ? heroImg.marketingPageTitle
        : '';
    } else if (pagePrefix === 'page_stallion_match_farm') {
      heroImageRes['imageName'] = heroImg.bgImage ? heroImg.bgImage : '';
    }

    return heroImageRes;
  }

  /* Formate response for page section Banner1 */
  formatBanner1(pagePrefix, bnr1) {
    let banner1Res = {
      sectionName: bnr1.sectionName,
      marketingPageSectionUuid: bnr1.marketingPageSectionUuid,
      title: bnr1.marketingPageTitle ? bnr1.marketingPageTitle : '',
      bgImage: bnr1.bgImage ? bnr1.bgImage : '',
    };
    if (pagePrefix === 'page_home') {
      banner1Res['description1'] = bnr1.bannerDescription1
        ? bnr1.bannerDescription1
        : '';
      banner1Res['description2'] = bnr1.bannerDescription2
        ? bnr1.bannerDescription2
        : '';
      banner1Res['description3'] = bnr1.bannerDescription3
        ? bnr1.bannerDescription3
        : '';
    } else if (pagePrefix === 'page_stallion_match_farm') {
      banner1Res['description'] = bnr1.marketingPageDescription
        ? bnr1.marketingPageDescription
        : '';
      banner1Res['buttonText'] = bnr1.buttonText ? bnr1.buttonText : '';
      banner1Res['buttonTarget'] = bnr1.buttonTarget ? bnr1.buttonTarget : '';
    }

    return banner1Res;
  }

  /* Formate response for page section Banner2 */
  formatBanner2(bnr2) {
    return {
      sectionName: bnr2.sectionName,
      marketingPageSectionUuid: bnr2.marketingPageSectionUuid,
      title: bnr2.marketingPageTitle ? bnr2.marketingPageTitle : '',
      description: bnr2.marketingPageDescription
        ? bnr2.marketingPageDescription
        : '',
      buttonText: bnr2.buttonText ? bnr2.buttonText : '',
      buttonTarget: bnr2.marketingPageTarget ? bnr2.marketingPageTarget : '',
      bgImage: bnr2.bgImage ? bnr2.bgImage : '',
    };
  }

  /* Formate data to update page section Main heading */
  formatUpdateMainHeading(pagePrefix, mainHeading) {
    let mainHeadingRes = {
      marketingPageTitle: mainHeading.title ? mainHeading.title : '',
      marketingPageDescription: mainHeading.description
        ? mainHeading.description
        : '',
    };
    if (pagePrefix === 'page_stallion_match_farm') {
      mainHeadingRes['marketingPagePlaceholder'] = mainHeading.emailAddress
        ? mainHeading.emailAddress
        : '';
      mainHeadingRes['marketingPageTarget'] = mainHeading.buttonTarget
        ? mainHeading.buttonTarget
        : '';
    }

    return mainHeadingRes;
  }

  /* Formate data to update page section Hero image */
  formatUpdateHeroImage(heroImage) {
    return {
      marketingPageTitle: heroImage.title,
    };
  }

  /* Formate data to update page section Banner1 */
  formatUpdateBanner1(pagePrefix, banner1) {
    let banner1Res = {
      marketingPageTitle: banner1.title ? banner1.title : '',
    };
    if (pagePrefix === 'page_home') {
      banner1Res['marketingPageDescription1'] = banner1.bannerDescription1
        ? banner1.bannerDescription1
        : '';
      banner1Res['marketingPageDescription2'] = banner1.bannerDescription2
        ? banner1.bannerDescription2
        : '';
      banner1Res['marketingPageDescription3'] = banner1.bannerDescription3
        ? banner1.bannerDescription3
        : '';
    } else if (pagePrefix === 'page_stallion_match_farm') {
      banner1Res['marketingPageDescription'] = banner1.description
        ? banner1.description
        : '';
      banner1Res['marketingPageButtonText'] = banner1.buttonText
        ? banner1.buttonText
        : '';
      banner1Res['marketingPageTarget'] = banner1.buttonTarget
        ? banner1.buttonTarget
        : '';
    }
    return banner1Res;
  }

  /* Formate data to update page section Banner1 */
  formatUpdateBanner2(banner2) {
    return {
      marketingPageTitle: banner2.title,
      marketingPageDescription: banner2.description,
      marketingPageButtonText: banner2.buttonText,
      marketingPageTarget: banner2.buttonTarget,
    };
  }

  /* Formate data to update page section header footer banner for registered user */
  formatUpdateHeaderFooterBannerRegistered(headerOrFooter) {
    return {
      marketingPageTitle: headerOrFooter.title,
      marketingPageDescription: headerOrFooter.description,
      marketingPageButtonText: headerOrFooter.buttonText,
      marketingPageButtonUrl: headerOrFooter.buttonUrl,
      isRegistered: headerOrFooter.isRegistered,
    };
  }

  /* Formate data to update page section header footer banner for anonymous user */
  formatUpdateHeaderFooterBanner(headerOrFooter) {
    return {
      marketingPageTitle: headerOrFooter.title,
      marketingPageDescription: headerOrFooter.description,
      marketingPageButtonText: headerOrFooter.buttonText,
      marketingPageButtonUrl: headerOrFooter.buttonUrl,
      isAnonymous: headerOrFooter.isAnonymous,
    };
  }

  /* Formate data to create Main header */
  formatNewMainHeading(pagePrefix, mainHding) {
    let mainHeadingRes = {
      marketingPageTitle: mainHding.title,
      marketingPageId: mainHding.marketingPageId,
      marketingPageSectionId: mainHding.marketingPageSectionId,
      marketingPageDescription: mainHding.description,
      isAuthenticated: false,
    };
    if (pagePrefix === 'page_stallion_match_farm') {
      mainHeadingRes['marketingPagePlaceholder'] = mainHding.emailAddress;
      mainHeadingRes['marketingPageTarget'] = mainHding.buttonText;
    }

    return mainHeadingRes;
  }

  /* Formate data to create Hero image */
  formatNewHeroImage(pagePrefix, heroImg) {
    let heroImageRes = {
      marketingPageId: heroImg.marketingPageId,
      marketingPageSectionId: heroImg.marketingPageSectionId,
      isAuthenticated: false,
    };
    if (pagePrefix === 'page_home') {
      heroImageRes['marketingPageTitle'] = heroImg.title;
    } else if (pagePrefix === 'page_stallion_match_farm') {
      heroImageRes['marketingPageTitle'] = '';
    }

    return heroImageRes;
  }

  /* Formate data to create Banner1 */
  formatNewBanner1(pagePrefix, bnr1) {
    let banner1Res = {
      marketingPageTitle: bnr1.title,
      marketingPageId: bnr1.marketingPageId,
      marketingPageSectionId: bnr1.marketingPageSectionId,
      isAuthenticated: false,
    };
    if (pagePrefix === 'page_home') {
      banner1Res['marketingPageDescription1'] = bnr1.bannerDescription1;
      banner1Res['marketingPageDescription2'] = bnr1.bannerDescription2;
      banner1Res['marketingPageDescription3'] = bnr1.bannerDescription3;
    } else if (pagePrefix === 'page_stallion_match_farm') {
      banner1Res['marketingPageDescription'] = bnr1.description;
      banner1Res['marketingPageButtonText'] = bnr1.buttonText;
      banner1Res['marketingPageTarget'] = bnr1.buttonTarget;
    }

    return banner1Res;
  }

  /* Formate data to create Banner2 */
  formatNewBanner2(bnr2) {
    let banner1Res = {
      marketingPageTitle: bnr2.title,
      marketingPageId: bnr2.marketingPageId,
      marketingPageSectionId: bnr2.marketingPageSectionId,
      marketingPageDescription: bnr2.description,
      marketingPageButtonText: bnr2.buttonText ? bnr2.buttonText : '',
      marketingPageButtonUrl: bnr2.buttonUrl ? bnr2.buttonUrl : '',
      marketingPageTarget: bnr2.buttonTarget,
      isAuthenticated: false,
    };

    return banner1Res;
  }

  /* Formate header or footer for registered user */
  formatHeaderFooterBannerRegistered(headerOrFooter) {
    const headerFooterRes = {
      sectionName: headerOrFooter.sectionName,
      marketingPageSectionUuid: headerOrFooter.marketingPageSectionUuid,
      title: headerOrFooter.marketingPageTitle
        ? headerOrFooter.marketingPageTitle
        : '',
      description: headerOrFooter.marketingPageDescription
        ? headerOrFooter.marketingPageDescription
        : '',
      buttonText: headerOrFooter.buttonText ? headerOrFooter.buttonText : '',
      buttonUrl: headerOrFooter.buttonUrl ? headerOrFooter.buttonUrl : '',
      isRegistered: headerOrFooter.isRegistered
        ? headerOrFooter.isRegistered
        : false,
    };

    return headerFooterRes;
  }

  /* Formate header or footer for anonymous user */
  formatHeaderFooterBanner(headerOrFooter) {
    const headerFooterRes = {
      sectionName: headerOrFooter.sectionName,
      marketingPageSectionUuid: headerOrFooter.marketingPageSectionUuid,
      title: headerOrFooter.marketingPageTitle
        ? headerOrFooter.marketingPageTitle
        : '',
      description: headerOrFooter.marketingPageDescription
        ? headerOrFooter.marketingPageDescription
        : '',
      buttonText: headerOrFooter.buttonText ? headerOrFooter.buttonText : '',
      buttonUrl: headerOrFooter.buttonUrl ? headerOrFooter.buttonUrl : '',
      isAnonymous: headerOrFooter.isAnonymous
        ? headerOrFooter.isAnonymous
        : false,
    };

    return headerFooterRes;
  }

  /* Formate header or footer */
  formatNewHeaderFooterBanner(headerOrFooter) {
    return {
      marketingPageTitle: headerOrFooter.title,
      marketingPageDescription: headerOrFooter.description,
      marketingPageButtonText: headerOrFooter.buttonText,
      marketingPageButtonUrl: headerOrFooter.buttonUrl,
      isAuthenticated: headerOrFooter.isRegistered,
      isAnonymous: headerOrFooter.isAnonymous,
    };
  }

  /* Get Additinal info like testimonial, carousel, overview, clientLogos and tilePermissions etc.*/
  async getAdditonInfo(marketingPageId: number, secType: string, options) {
    let secPageQueryBuilder = getRepository(MarketingPageSection)
      .createQueryBuilder('mrktPageSec')
      .select(
        'mrktPageSec.id as id, mrktPageSec.marketingPageId as marketingPageId,mrktPageSec.marketingPageSectionType as sectionType,mrktPageSec.marketingPageSectionUuid as marketingPageSectionUuid',
      )
      .andWhere('mrktPageSec.marketingPageId = :marketingPageId', {
        marketingPageId: marketingPageId,
      });

    if (secType == 'testimonial') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'testimonial'",
      );
    } else if (secType == 'carousel') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'carousel'",
      );
    } else if (secType == 'overview') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'reportsOverview'",
      );
    } else if (secType == 'clientLogos') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'clientLogos'",
      );
    } else if (secType == 'tilePermissions') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'tilePermissions'",
      );
    } else if (secType == 'freePricingTile') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'freePricingTile'",
      );
    } else if (secType == 'promotedPricingTile') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'promotedPricingTile'",
      );
    } else if (secType == 'racehorse') {
      secPageQueryBuilder.andWhere(
        "mrktPageSec.marketingPageSectionType = 'racehorse'",
      );
    }

    const section = await secPageQueryBuilder.getRawOne();
    if (
      secType == 'tilePermissions' ||
      secType == 'freePricingTile' ||
      secType == 'promotedPricingTile'
    ) {
      const tiles = await this.getTilePermissions(
        section['id'],
        section['sectionType'],
      );
      return {
        marketingPageSectionId: section['marketingPageSectionUuid'],
        list: tiles,
      };
    } else if (secType == 'racehorse') {
      const raceHorses = await this.getRaceHorses(
        section['id'],
        section['sectionType'],
        options,
      );
      return {
        marketingPageSectionId: section['marketingPageSectionUuid'],
        list: raceHorses,
      };
    } else {
      const additonalInfo =
        await this.marketingAdditonInfoService.findAllByMarketingPageSectionIdAndSectionType(
          section['id'],
          section['sectionType'],
        );
      return {
        marketingPageSectionId: section['marketingPageSectionUuid'],
        list: additonalInfo.entities,
      };
    }
  }

  /* Get Raceh horse.*/
  // It will remove once race horse logic will be implemented.
  async getRaceHorses(marketingPageId: number, secType: string, options) {
    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireHorse.horseName as sireName, sireHorse.id as sirePedigreeId',
      );

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select('damHorse.horseName as damName, damHorse.id as damPedigreeId');

    let queryBuilder = getRepository(Runner)
      .createQueryBuilder('raceHorse')
      .select('raceHorse.runnerUuid as runnerId, raceHorse.createdOn')
      .addSelect(
        'horse.horseUuid as horseId, horse.horseName, horse.isActive, horse.yob, sire.sireName, dam.damName',
      )
      .addSelect('country.countryCode as countryCode')
      .addSelect('races.raceDate as raceDate,races.raceUuid as raceId')
      .innerJoin('raceHorse.horses', 'horse')
      .innerJoin('raceHorse.races', 'races')
      .leftJoin('horse.nationality', 'country')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sirePedigreeId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damPedigreeId=horse.damId',
      );

    if (options.limit) {
      queryBuilder.offset(options.skip).limit(options.limit);
    }
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /* Get tiles Permission list */
  getTilePermissions(marketingPageSectionId: number, sectionType: string) {
    let titlePerQueryBuilder = getRepository(
      MarketingTilePermissions,
    ).createQueryBuilder('tp');

    if (sectionType == 'tilePermissions') {
      titlePerQueryBuilder.select(
        'tp.titlePermissionsUuid as id, tp.marketingPagePermissionTitle as title, tp.isAnonymous as isAnonymous, tp.isRegistered as isRegistered, tp.marketingPageTilePermissionsPosition as position',
      );
    } else {
      titlePerQueryBuilder.select(
        'tp.titlePermissionsUuid as id, tp.marketingPagePermissionTitle as title, tp.marketingPageTilePermissionsPosition as position',
      );
    }

    titlePerQueryBuilder.andWhere(
      'tp.marketingPageSectionId = :marketingPageSectionId',
      { marketingPageSectionId: marketingPageSectionId },
    );

    return titlePerQueryBuilder.getRawMany();
  }
}
