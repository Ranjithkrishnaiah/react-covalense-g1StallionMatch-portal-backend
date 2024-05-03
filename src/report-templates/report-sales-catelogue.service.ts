import { Injectable } from '@nestjs/common';
import { Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Horse } from 'src/horses/entities/horse.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { ConfigService } from '@nestjs/config';
import { OrderTransaction } from 'src/order-transaction/entities/order-transaction.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { SalesLot } from 'src/sales-lots/entities/sales-lot.entity';

@Injectable()
export class ReportSalesCatelogueService {
  constructor(
    @InjectRepository(Horse)
    readonly horseRepository: Repository<Horse>,
    readonly commonUtilsService: CommonUtilsService,
    readonly fileUploadsService: FileUploadsService,
    readonly configService: ConfigService,
  ) {}

  async findOrderInfoByOrderId(orderProductId,productCode) {
    let queryBuilder = await getRepository(OrderTransaction)
      .createQueryBuilder('ordertransaction')
      .select(
        'ordertransaction.orderId as orderId, orderproduct.quantity as quantity, orderProductItem.sales, ordertransaction.createdOn as createdDate,orderProductItem.lotId lotId, orderProductItem.stallionId',
      )
      .innerJoin('ordertransaction.orderproduct', 'orderproduct')
      .innerJoin('orderproduct.product', 'product')
      .leftJoin('orderproduct.orderProductItem', 'orderProductItem')
      .andWhere('product.productCode = :productCode', {
        productCode: productCode 
      })
      .andWhere('orderproduct.id = :orderProductId', {
        orderProductId: orderProductId,
      })
      .orderBy('ordertransaction.orderId', 'DESC')
      .getRawMany();
    return queryBuilder;
  }

  async findSaleInfoBySaleId(saleId) {
    let queryBuilder = await getRepository(Sale)
      .createQueryBuilder('sale')
      .select(
        'sale.salesName as saleName,salescompany.salescompanyName as companyName, sale.startDate as startDate,sale.countryId countryId',
      )
      .innerJoin('sale.salesCompany', 'salescompany')
      //.innerJoin('sale.country', 'country')
      // .innerJoin('sale.country', 'country')
      .andWhere('sale.id = :saleId', { saleId: saleId })
      .getRawOne();

    return queryBuilder;
  }

  async findLotInfo(lotId) {
    let queryBuilder = await getRepository(SalesLot)
      .createQueryBuilder('saleslot')
      .select(
        'horse.horseUuid as horseUuid,horse.id as horseId,saleslot.horseGender as horseGender, saleslot.venderName as vendor,saleslot.lotNumber lotNumber, saleslot.lotType lotType, horse.sireId, horse.damId, horse.horseName, sire.horseName sireName,dam.horseName damName',
      )
      .addSelect('colour.colourName horseColour')
      .addSelect('lottype.salesTypeName lotType')
      .innerJoin('saleslot.horse', 'horse')
      .leftJoin('saleslot.salesLotInfoTemp', 'salesLotInfoTemp')
      .innerJoin('horse.colour', 'colour')
      .innerJoin('horse.sire', 'sire')
      .innerJoin('horse.dam', 'dam')
      .leftJoin('saleslot.lottype', 'lottype')
      // .innerJoin('sale.country', 'country')
      //.andWhere("saleslot.salesId = :saleId", { saleId: 1})
      .andWhere('saleslot.id = :lotId', { lotId: lotId })
      .getRawOne();

    return queryBuilder;
  }

  async getImpactProfile(horseId, countryId) {
    // horseId=805053,countryId=11
    let entities = await this.horseRepository.manager.query(
      `EXEC proc_SMPSalesReportImpactProfile 
        @phorseid=@0,
        @pCountry=@1`,
      [horseId, countryId],
    );
    console.log('impact profile entities', entities);
    let data = [];
    let tabelTitles = {};
    let finalTableData = [];
    if (entities) {
      await entities.reduce(async (prom, element, index) => {
        await prom;
        let elementData = Object.entries(element);
        let column2Idx: number;
        let column3Idx: number;
        let column4Idx: number;
        let column5Idx: number;
        let column6Idx: number;

        await elementData.map(async (ele, eleIndex) => {
          if (ele[0].includes('(S)')) {
            column2Idx = eleIndex;
          } else if (ele[0].includes('(SS)')) {
            column3Idx = eleIndex;
          } else if (ele[0].includes('(SSS)')) {
            column4Idx = eleIndex;
          } else if (ele[0].includes('(SDS)')) {
            column5Idx = eleIndex;
          } else if (ele[0].includes('(SDDD)')) {
            column6Idx = eleIndex;
          }
        });
        if (index === 0) {
          tabelTitles = {
            column1: {
              name: await this.commonUtilsService.toTitleCase(
                elementData[0][1],
              ),
              color: '',
            },
            column2: {
              name: await this.commonUtilsService.toTitleCase(
                elementData[column2Idx][0].replace('(S)', ''),
              ),
              color: '',
            },
            column3: {
              name: await this.commonUtilsService.toTitleCase(
                elementData[column3Idx][0].replace('(SS)', ''),
              ),
              color: '',
            },
            column4: {
              name: await this.commonUtilsService.toTitleCase(
                elementData[column4Idx][0].replace('(SSS)', ''),
              ),
              color: '',
            },
            column5: {
              name: await this.commonUtilsService.toTitleCase(
                elementData[column5Idx][0].replace('(SDS)', ''),
              ),
              color: '',
            },
            column6: {
              name: await this.commonUtilsService.toTitleCase(
                elementData[column6Idx][0].replace('(SDDD)', ''),
              ),
              color: '',
            },
          };
          finalTableData.push(tabelTitles);
        }

        let col1 = (elementData[0][1] as string).split('(')[0];
        let col2Arr = (elementData[column2Idx][1] as string).split('/');
        let col2 = col2Arr[0] + '% (' + col2Arr[1] + ')';
        let col3Arr = (elementData[column3Idx][1] as string).split('/');
        let col3 = col3Arr[0] + '% (' + col3Arr[1] + ')';
        let col4Arr = (elementData[column4Idx][1] as string).split('/');
        let col4 = col4Arr[0] + '% (' + col4Arr[1] + ')';
        let col5Arr = (elementData[column5Idx][1] as string).split('/');
        let col5 = col5Arr[0] + '% (' + col5Arr[1] + ')';
        let col6Arr = (elementData[column6Idx][1] as string).split('/');
        let col6 = col6Arr[0] + '% (' + col6Arr[1] + ')';

        finalTableData.push({
          column1: {
            name: await this.commonUtilsService.toTitleCase(col1),
            color: '',
          },
          column2: {
            name: col2,
            color: '',
          },
          column3: {
            name: col3,
            color: '',
          },
          column4: {
            name: col4,
            color: '',
          },
          column5: {
            name: col5,
            color: '',
          },
          column6: {
            name: col6,
            color: '',
          },
        });
      }, Promise.resolve());

      return finalTableData;
    }
  }
}
