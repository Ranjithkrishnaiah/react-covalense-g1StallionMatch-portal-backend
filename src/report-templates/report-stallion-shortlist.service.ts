import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Horse } from 'src/horses/entities/horse.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReportStallionShortlistService {
  constructor(
    @InjectRepository(Horse)
    readonly horseRepository: Repository<Horse>,
    readonly commonUtilsService: CommonUtilsService,
    readonly fileUploadsService: FileUploadsService,
    readonly configService: ConfigService,
  ) {}

  async getSuccessProfile(sireId, damId) {
    let entities = await this.horseRepository.manager.query(
      `EXEC proc_SMPSuccessProfile 
        @pStallionId=@0,
        @pMareId=@1`,
      [sireId, damId],
    );
    console.log('success entities', entities);
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
          console.log('tabelTitles', tabelTitles);
        }
        if (!data[element.DamSideAncestor]) {
          data[element.DamSideAncestor] = [];
          let col1 = (elementData[3][1] as string).split('(')[0];
          data[element.DamSideAncestor].push({
            column1: {
              name: await this.commonUtilsService.toTitleCase(col1),
              color: '',
            },
            column2: {
              name: elementData[column2Idx][1],
              color: '',
            },
            column3: {
              name: elementData[column3Idx][1],
              color: '',
            },
            column4: {
              name: elementData[column4Idx][1],
              color: '',
            },
            column5: {
              name: elementData[column5Idx][1],
              color: '',
            },
            column6: {
              name: elementData[column6Idx][1],
              color: '',
            },
            columnSeq: element.SEQ,
          });
        }
        if (
          !data[element.DamSideAncestor][0].column2.name ||
          data[element.DamSideAncestor][0].column2.name === '-'
        ) {
          data[element.DamSideAncestor][0].column2.name = elementData[
            column2Idx
          ][1]
            ? elementData[column2Idx][1]
            : '-';
        }
        if (
          !data[element.DamSideAncestor][0].column3.name ||
          data[element.DamSideAncestor][0].column3.name === '-'
        ) {
          data[element.DamSideAncestor][0].column3.name = elementData[
            column3Idx
          ][1]
            ? elementData[column3Idx][1]
            : '-';
        }
        if (
          !data[element.DamSideAncestor][0].column4.name ||
          data[element.DamSideAncestor][0].column4.name === '-'
        ) {
          data[element.DamSideAncestor][0].column4.name = elementData[
            column4Idx
          ][1]
            ? elementData[column4Idx][1]
            : '-';
        }
        if (
          !data[element.DamSideAncestor][0].column5.name ||
          data[element.DamSideAncestor][0].column5.name === '-'
        ) {
          data[element.DamSideAncestor][0].column5.name = elementData[
            column5Idx
          ][1]
            ? elementData[column5Idx][1]
            : '-';
        }
        if (
          !data[element.DamSideAncestor][0].column6.name ||
          data[element.DamSideAncestor][0].column6.name === '-'
        ) {
          data[element.DamSideAncestor][0].column6.name = elementData[
            column6Idx
          ][1]
            ? elementData[column6Idx][1]
            : '-';
        }
      }, Promise.resolve());
      let resultValues: any = data.filter(function (item) {
        return item != null;
      });

      finalTableData.push(tabelTitles);
      // Sort the outer array based on the columnSeq property of the inner objects
      resultValues.sort((a, b) => a[0].columnSeq - b[0].columnSeq);
      await resultValues.reduce(async (parentPromise, parentItem) => {
        await parentPromise;
        await parentItem.reduce(async (promise, item) => {
          await promise;
          finalTableData.push(item);
        }, Promise.resolve());
      }, Promise.resolve());
    }
    console.log('success finalTableData', finalTableData);
    return finalTableData;
  }
}
