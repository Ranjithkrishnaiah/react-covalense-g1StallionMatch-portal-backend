import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductResponseDto } from './dto/product-response.dto';
import { SearchProductByCategoryDto } from './dto/search-product-by-category.dto';
import { Product } from './entities/product.entity';
import { PRODUCTCODES } from 'src/utils/constants/products';
import { DEFAULT_VALUES } from 'src/utils/constants/common';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /* Get all Products */
  findAll(): Promise<ProductResponseDto[]> {
    let queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .select(
        'product.id, product.productName, product.categoryId, product.marketingPageInfoId, product.productCode productCode',
      )
      .addSelect('pricing.price as price')
      .addSelect(
        'currency.id as currencyId, currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .innerJoin('product.pricing', 'pricing')
      .innerJoin('pricing.currency', 'currency', 'currency.id = :currencyId', {
        currencyId: DEFAULT_VALUES.CURRENCY,
      })
      .orderBy('product.id', 'ASC')
      .getRawMany();

    return queryBuilder;
  }

  /* Get a Product */
  findOne(fields: any) {
    return this.productRepository.findOne({
      where: fields,
    });
  }

  /* Get all Products By Category */
  async findProductsByCategory(searchOption: SearchProductByCategoryDto) {
    let queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .select(
        'product.id as productId, product.productName as productName, product.productCode as productCode',
      )
      .addSelect(
        'marketingAdditonInfo.marketingPageAdditionInfoTitle  as marketingPageAdditionInfoTitle ,marketingAdditonInfo.marketingPageAdditionInfoDescription as description, marketingAdditonInfo.marketingPageAdditionInfoButtonText as buttonText, marketingAdditonInfo.isActive as isActive',
      )
      .addSelect('pricing.price as price')
      .addSelect(
        'media.mediaUrl as imageUrl, media.mediaFileType as mediaFileType',
      )
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      //.distinct(true)
      .innerJoin('product.marketingAdditonInfo', 'marketingAdditonInfo')
      .innerJoin('product.pricing', 'pricing')
      .innerJoin('pricing.currency', 'currency', 'currency.id = :currencyId', {
        currencyId: searchOption.currencyId,
      })
      .leftJoin('marketingAdditonInfo.aditnMedia', 'aditnMedia')
      .leftJoin('aditnMedia.media', 'media')
      .andWhere('marketingAdditonInfo.isActive = 1')
      .andWhere('product.isActive = 1')
      .andWhere('media.markForDeletion = 0')
      .andWhere('product.categoryId = :categoryId', {
        categoryId: searchOption.categoryId,
      })
      .orderBy('marketingAdditonInfo.marketingPageAdditionInfoPosition', 'ASC');
  
    const entities = await queryBuilder.getRawMany();
    return await this.formatReports(entities);
  }

  /* Get Formatted Reports */
  formatReports(list) {
    let ids = [];
    let newList = [];
    let imageList = list.filter(function (item) {
      return item.mediaFileType != 'application/pdf' && item.imageUrl;
    });
    for (let i = 0; i < list.length; i++) {
      const index = ids.indexOf(list[i].productId);
      if (index == -1) {
        ids.push(list[i].productId);

        if (list[i].mediaFileType == 'application/pdf') {
          list[i]['reportUrl'] = list[i].imageUrl;
          if (!imageList.length) {
            list[i]['imageUrl'] = null;
          }
        } else {
          list[i]['reportUrl'] = null;
        }
        delete list[i].mediaFileType;
        newList.push(list[i]);
      } else {
        if (list[i].imageUrl) {
          if (list[i].mediaFileType == 'application/pdf') {
            newList[index]['reportUrl'] = list[i].imageUrl;
          } else {
            newList[index]['imageUrl'] = list[i].imageUrl;
          }
        }
      }
    }

    return newList;
  }

  /* Get a Product by Code */
  async getProductInfoByProductCode(productCode) {
    try {
      let data = await this.productRepository
        .createQueryBuilder('product')
        .select('product.id, product.productName')
        .addSelect('pricing.price as price')
        .addSelect(
          'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
        )
        .innerJoin('product.pricing', 'pricing')
        .innerJoin(
          'pricing.currency',
          'currency',
          'currency.id = :currencyId',
          { currencyId: DEFAULT_VALUES.CURRENCY },
        )
        .where('product.productCode = :productCode', {
          productCode: productCode,
        })
        .orderBy('product.id', 'ASC')
        .getRawOne();
      return data;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  /* Get all Products By Category Test */
  async findProductsByCategoryTest(searchOption: SearchProductByCategoryDto) {
    let queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .select(
        'DISTINCT product.id as productId, product.productName as productName, product.productCode as productCode',
      )
      .addSelect(
        'marketingAdditonInfo.marketingPageAdditionInfoDescription as description, marketingAdditonInfo.marketingPageAdditionInfoButtonText as buttonText, marketingAdditonInfo.isActive as isActive',
      )
      .addSelect('pricing.price as price')
      .addSelect(
        'media.mediaUrl as imageUrl, media.mediaFileType as mediaFileType',
      )
      .addSelect(
        'currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .innerJoin('product.marketingAdditonInfo', 'marketingAdditonInfo')
      .innerJoin('product.pricing', 'pricing')
      .innerJoin('pricing.currency', 'currency', 'currency.id = :currencyId', {
        currencyId: searchOption.currencyId,
      })
      .leftJoin('marketingAdditonInfo.aditnMedia', 'aditnMedia')
      .leftJoin('aditnMedia.media', 'media')
      .andWhere('product.isActive = 1')
      .andWhere('media.markForDeletion = 0')
      .andWhere('product.categoryId = :categoryId', {
        categoryId: searchOption.categoryId,
      });

    const entities = await queryBuilder.getRawMany();
    return await this.formatReports(entities);
    
  }

  /* Get Product by code */
  async findOneByCode(productCode:string): Promise<ProductResponseDto> {
    let product =  await this.productRepository
      .createQueryBuilder('product')
      .select(
        'product.id, product.productName, product.categoryId, product.marketingPageInfoId, product.productCode productCode',
      )
      .addSelect('pricing.price as price')
      .addSelect(
        'currency.id as currencyId, currency.currencyCode as currencyCode, currency.currencySymbol as currencySymbol',
      )
      .innerJoin('product.pricing', 'pricing')
      .innerJoin('pricing.currency', 'currency', 'currency.id = :currencyId', {
        currencyId: DEFAULT_VALUES.CURRENCY,
      })
      .andWhere('product.productCode = :productCode',{productCode})
      .getRawOne();

    return product;
  }
  async format(data2){
   const  data1=  [
      {
        "productCode": PRODUCTCODES.REPORT_SHORTLIST_STALLION,
        "reportUrl": "https://uat-s3-lambda-bucket.s3.ap-southeast-2.amazonaws.com/69218218-391e-4d52-8cd7-4d4a6a83fba3/ShortlistReport.pdf"
      },
      {
        "productCode": PRODUCTCODES.REPORT_STALLION_MATCH_PRO,
        "reportUrl": "https://uat-s3-lambda-bucket.s3.ap-southeast-2.amazonaws.com/69218218-391e-4d52-8cd7-4d4a6a83fba3/StallionMatchProReport.pdf"
      },
      {
        "productCode": PRODUCTCODES.REPORT_BROODMARE_AFFINITY,
        "reportUrl": "https://uat-s3-lambda-bucket.s3.ap-southeast-2.amazonaws.com/69218218-391e-4d52-8cd7-4d4a6a83fba3/MareAffinityReport.pdf"
      },
      {
        "productCode": PRODUCTCODES.REPORT_STALLION_MATCH_SALES,
        "reportUrl": "https://uat-s3-lambda-bucket.s3.ap-southeast-2.amazonaws.com/69218218-391e-4d52-8cd7-4d4a6a83fba3/SalesReport.pdf"
      },
      {
        "productCode": PRODUCTCODES.REPORT_STALLION_AFFINITY,
        "reportUrl": "https://uat-s3-lambda-bucket.s3.ap-southeast-2.amazonaws.com/69218218-391e-4d52-8cd7-4d4a6a83fba3/StallionAffinityReport.pdf"
      },
      {
        "productCode": PRODUCTCODES.REPORT_BROODMARE_SIRE,
        "reportUrl": "https://uat-s3-lambda-bucket.s3.ap-southeast-2.amazonaws.com/69218218-391e-4d52-8cd7-4d4a6a83fba3/DamsireReport.pdf"
      },
      {
        "productCode": PRODUCTCODES.REPORT_STALLION_BREEDING_STOCK_SALE,
        "reportUrl": "https://uat-s3-lambda-bucket.s3.ap-southeast-2.amazonaws.com/69218218-391e-4d52-8cd7-4d4a6a83fba3/SalesReport.pdf"
      }
    ]
    const finalData =[]
    for (const item of data2) {
      const matchingStaticItem = data1.find(staticItem => staticItem.productCode === item.productCode);
      if (matchingStaticItem) {
        item.reportUrl = matchingStaticItem.reportUrl;
      }
      finalData.push(item)
    }
    
  
    return finalData;
    
  }
}
