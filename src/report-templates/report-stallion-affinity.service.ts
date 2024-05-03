import { Injectable } from '@nestjs/common';
import { getRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Horse } from 'src/horses/entities/horse.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { ConfigService } from '@nestjs/config';
import { ReportTemplatesCommonService } from './report-templates-common.service';
import { Stallion } from 'src/stallions/entities/stallion.entity';

@Injectable()
export class ReportStallionAffinityService {
  constructor(
    @InjectRepository(Horse)
    readonly horseRepository: Repository<Horse>,
    readonly commonUtilsService: CommonUtilsService,
    readonly fileUploadsService: FileUploadsService,
    readonly rtCommonService: ReportTemplatesCommonService,
    readonly configService: ConfigService,
  ) {}

  async getAncestorsAffinityWithSireSummaryList(
    stallionId,
    sPositionStrikeRateRanges,
  ) {
    let entities = await this.horseRepository.manager.query(
      `EXEC proc_SMPDamAncestorAffinityWithSireComponents 
              @pStallionid=@0`,
      [stallionId],
    );

    const sSPositionStrikeRateRanges =
      await this.getStallionAffinityStrikeRateRanges('SS');
    const dSPositionStrikeRateRanges =
      await this.getStallionAffinityStrikeRateRanges('DS');
    const dSSPositionStrikeRateRanges =
      await this.getStallionAffinityStrikeRateRanges('DSS');

    entities = entities.filter((e)=> e.H2SideHorseid);
    console.log('===== proc_SMPDamAncestorAffinityWithSireComponents entities',entities)
    let data = [];
    let tempList = [];
    let tabelTitles = {};
    let newList = [];
    await entities.reduce(async (promise, element, index) => {
      await promise;
      let elementData = Object.entries(element);
      if (index === 0) {
        let hArr = [
          elementData[7][0],
          elementData[8][0],
          elementData[9][0],
          elementData[10][0],
        ];
        let headerData =
          await this.rtCommonService.setSireDamGrandSireGrandDamSire(hArr);
        tabelTitles = {
          column1: 'NAME',
          column2: 'SWS',
          column3: headerData['column3'],
          column4: headerData['column4'],
          column5: headerData['column5'],
          column6: headerData['column6'],
        };
      }
      let item = await this.formateData(
        elementData,
        sPositionStrikeRateRanges,
        sSPositionStrikeRateRanges,
        dSPositionStrikeRateRanges,
        dSSPositionStrikeRateRanges,
      );
      tempList.push(item);
    }, Promise.resolve());

    // sum stakeWinners If there are duplicate H2SideHorseName
    for (const element of tempList) {
      let index = newList.findIndex(
        (item) => item.H2SideHorseid === element.H2SideHorseid,
      );
      if (index == -1) {
        newList.push(element);
      } else {
        if (newList[index].level <= element.level) {
          newList[index].column2 = newList[index].column2 + element.column2;
        } else {
          element.column2 = newList[index].column2 + element.column2;
          newList[index] = element;
        }
        const keys = Object.keys(element);
        for (let key of keys) {
          if (
            element.column3 ||
            element.column4 ||
            element.column5 ||
            element.column6
          ) {
            if (!newList[index][key] && element[key]) {
              newList[index][key] = element[key];
            }
          }
        }
      }
    }
    // Add Children
    for (let element of newList) {
      let children = await this.getChildren(element, newList);
      for (let item of children) {
        let childs = await this.getChildren(item, newList);
        item['children'] = childs;
      }
      element['children'] = children;
    }

    // Sort by commonsortorder
    newList.sort((a, b) => {
      return b.commonsortorder - a.commonsortorder;
    });

    for (let element of newList) {
      let children = JSON.parse(JSON.stringify(element.children));
      delete element.children;
      data.push(element);
      for (let item of children) {
        item['level'] = 2;
        let childs = JSON.parse(JSON.stringify(item['children']));
        delete item['children'];
        data.push(item);
        for (let ch of childs) {
          ch['level'] = 3;
          delete ch['children'];
          data.push(ch);
        }
      }
    }

    console.log('==========================',data)

    return {
      commonAncestorsTabelTitles: tabelTitles,
      commonAncestorsList: data,
    };
  }

  async formateData(
    elementData,
    sPositionStrikeRateRanges,
    sSPositionStrikeRateRanges,
    dSPositionStrikeRateRanges,
    dSSPositionStrikeRateRanges,
  ) {
    const column3 = elementData[7][1] ? elementData[7][1] : 0;
    const column4 = elementData[8][1] ? elementData[8][1] : 0;
    const column5 = elementData[9][1] ? elementData[9][1] : 0;
    const column6 = elementData[10][1] ? elementData[10][1] : 0;
    return {
      column1: await this.commonUtilsService.toTitleCase(elementData[1][1]),
      column2: elementData[6][1] ? elementData[6][1] : 0,
      column3: elementData[7][1] ? elementData[7][1] : 0,
      column4: elementData[8][1] ? elementData[8][1] : 0,
      column5: elementData[9][1] ? elementData[9][1] : 0,
      column6: elementData[10][1] ? elementData[10][1] : 0,
      column3Color:
        await this.rtCommonService.getColourForAncestorsAffinityComponents(
          column3,
          sPositionStrikeRateRanges,
        ),
      column4Color:
        await this.rtCommonService.getColourForAncestorsAffinityComponents(
          column4,
          sSPositionStrikeRateRanges,
        ),
      column5Color:
        await this.rtCommonService.getColourForAncestorsAffinityComponents(
          column5,
          dSPositionStrikeRateRanges,
        ),
      column6Color:
        await this.rtCommonService.getColourForAncestorsAffinityComponents(
          column6,
          dSSPositionStrikeRateRanges,
        ),
      H2SideHorseid: elementData[0][1],
      lvl: elementData[2][1],
      level: 1,
      sex: elementData[3][1],
      parent: elementData[4][1],
      commonsortorder: elementData[5][1],
      children: [],
    };
  }

  async getChildren(item, list) {
    let children = list.filter((ch) => {
      return item.H2SideHorseid === ch.parent;
    });
    for (let item of children) {
      let index = list.findIndex((e) => e === item);
      list.splice(index, 1);
    }
    return children;
  }

  async getStallionAffinityStakeWinnersComparisonList(stallionId) {
    let entities = await this.horseRepository.manager.query(
      `EXEC proc_SMPStallionAffinityRelatedStakeWinnerComparison 
            @pStallionid=@0`,
      [stallionId],
    );

    // console.log('============================getStakeWinnersComparisonList',entities)

    return entities;
  }

  async getStallionAffinityStrikeRateRanges(position: string) {
    return await this.horseRepository.manager.query(
      `EXEC Proc_SMPGetStallionStrikeRateRangeByPosition 
              @pPosition=@0`,
      [position],
    );
  }

  async getStallionAffinityTopperformingBroodMareSires(
    stallionId,
    sPositionStrikeRateRanges,
  ) {
    let broodMareSires = [];
    let result = await this.horseRepository.manager.query(
      `EXEC proc_SMPStallionAffinityTopPerformingBroodMareSires 
            @pStallionid=@0`,
      [stallionId],
    );

    // console.log('============================getTopperformingBroodMareSires',result)
    await result.reduce(async (promise, item) => {
      await promise;
      broodMareSires.push({
        horseName: item.horseName,
        g1Winners: item.G1Winners,
        stakesWinners: item.StakeWinners,
        runners: item.Runners,
        g1RnrsPercent: item.G1RunnerPerc,
        sWsRnrsPercent: item.SWRunnerPerc,
        //   colour: 'grey'
        colour: await this.rtCommonService.getColourForTopPerformingSireLines(
          item.SWRunnerPerc,
          sPositionStrikeRateRanges,
        ),
      });
    }, Promise.resolve());

    return broodMareSires;
  }

  async getStallion(stallionId) {
    const stallion = await getRepository(Stallion)
      .createQueryBuilder('stallion')
      .select('stallion.id as id, stallion.stallionUuid as stallionId')
      .addSelect('horse.id as horseId, horse.horseName as horseName')
      .innerJoin('stallion.horse', 'horse')
      .andWhere('stallion.id = :stallionId', { stallionId })
      .getRawOne();
    return stallion;
  }
}
