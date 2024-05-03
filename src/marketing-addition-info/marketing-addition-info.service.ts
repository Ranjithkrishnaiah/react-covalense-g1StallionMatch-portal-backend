import { Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { MarketingAdditonInfo } from './entities/marketing-addition-info.entity';

@Injectable()
export class MarketingAdditonInfoService {
  constructor() {}

  //Get All By MarketingPageSectionId And SectionType
  async findAllByMarketingPageSectionIdAndSectionType(
    marketingPageSectionId: number,
    sectionType: string,
  ) {
    let mrkAdditnQueryBuilder =
      getRepository(MarketingAdditonInfo).createQueryBuilder('additionInfo');

    if (sectionType == 'testimonial') {
      mrkAdditnQueryBuilder.select(
        'additionInfo.marketingPageAdditionInfoUuid as id, additionInfo.marketingPageAdditionInfoName as name, additionInfo.marketingPageAdditionInfoPosition as position, additionInfo.marketingPageAdditionInfoDescription as testimonial, additionInfo.marketingPageAdditionInfoCompany as company,additionInfo.marketingPageAdditionInfoCompanyUrl as companyUrl, additionInfo.isActive as isActive',
      );
    } else if (sectionType == 'carousel') {
      mrkAdditnQueryBuilder.select(
        'additionInfo.marketingPageAdditionInfoUuid as id, additionInfo.marketingPageAdditionInfoTitle as title, additionInfo.marketingPageAdditionInfoPosition as position, additionInfo.marketingPageAdditionInfoDescription as description, additionInfo.marketingPageAdditionInfoButtonText as buttonText,additionInfo.marketingPageAdditionInfoButtonUrl as buttonUrl,additionInfo.marketingPageAdditionInfoOrientation as orientation, additionInfo.isActive as isActive',
      );
    } else if (sectionType == 'reportsOverview') {
      mrkAdditnQueryBuilder.select(
        'additionInfo.marketingPageAdditionInfoUuid as id, additionInfo.marketingPageAdditionInfoTitle as title, additionInfo.marketingPageAdditionInfoPosition as position, additionInfo.marketingPageAdditionInfoDescription as description, additionInfo.marketingPageAdditionInfoButtonText as buttonText, additionInfo.isActive as isActive',
      );
    } else if (sectionType == 'clientLogos') {
      mrkAdditnQueryBuilder.select(
        'additionInfo.marketingPageAdditionInfoUuid as id, additionInfo.isActive as isActive',
      );
    }
    mrkAdditnQueryBuilder
      .leftJoin('additionInfo.aditnMedia', 'additionInfoMedia')
      .addSelect(
        'media.mediaUrl as imageUrl, media.mediaFileType as mediaFileType,media.fileName, media.mediaThumbnailUrl, media.mediaShortenUrl',
      )
      .leftJoin(
        'additionInfoMedia.media',
        'media',
        'media.id = additionInfoMedia.mediaId AND additionInfoMedia.marketingPageAdditionInfoId = additionInfo.id',
      )
      .orderBy('additionInfo.marketingPageAdditionInfoPosition', 'ASC')
      .andWhere(
        'additionInfo.marketingPageSectionId = :marketingPageSectionId',
        { marketingPageSectionId: marketingPageSectionId },
      );

    const count = await mrkAdditnQueryBuilder.getCount();
    const entities = this.formatOverview(
      await mrkAdditnQueryBuilder.getRawMany(),
      sectionType,
    );
    return { entities, count };
  }

  //Format Overview Data
  formatOverview(list, sectionType) {
    let ids = [];
    let newList = [];
    let imageList = list.filter(function (item) {
      return item.mediaFileType != 'application/pdf' && item.imageUrl;
    });
    for (let i = 0; i < list.length; i++) {
      const index = ids.indexOf(list[i].id);
      if (index == -1) {
        ids.push(list[i].id);

        if (sectionType == 'reportsOverview') {
          // if(list[i].mediaFileType == 'application/pdf') list[i]['pdfUrl'] = list[i].imageUrl;
          // else list[i]['pdfUrl'] = null;
          if (list[i].mediaFileType == 'application/pdf') {
            list[i]['pdfUrl'] = list[i].imageUrl;
            if (!imageList.length) {
              list[i]['imageUrl'] = null;
            }
          } else {
            list[i]['pdfUrl'] = null;
          }
        }
        delete list[i].mediaFileType;
        newList.push(list[i]);
      } else {
        // if(list[i].mediaFileType == 'application/pdf' && list[i].imageUrl) newList[index]['pdfUrl'] = list[i].imageUrl;
        // else if(list[i].imageUrl){
        //   newList[index]['imageUrl'] = list[i].imageUrl;
        // }
        if (list[i].imageUrl) {
          if (list[i].mediaFileType == 'application/pdf') {
            newList[index]['pdfUrl'] = list[i].imageUrl;
          } else {
            newList[index]['imageUrl'] = list[i].imageUrl;
          }
        }
      }
    }

    return newList;
  }
}
