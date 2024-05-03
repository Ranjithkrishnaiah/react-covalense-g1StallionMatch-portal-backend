import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FarmsService } from 'src/farms/farms.service';
import { HorsesService } from 'src/horses/horses.service';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Repository } from 'typeorm';
import { Stallion } from './entities/stallion.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { SearchStakeWinnerComparisonOptionsDto } from './dto/search-stake-winner-comparison-options.dto';
import { StallionsService } from './stallions.service';
import { StakesWinnerComparisionSort } from 'src/utils/constants/stallions';
import { SmSearchProfileDetailsOptionsDto } from './dto/sm-search-profile-details-options.dto';
import { AlternateMatingSuggestionsDto } from './dto/alternate-mating-suggestions.dto';

@Injectable({ scope: Scope.REQUEST })
export class StallionSearchService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Stallion)
    private stallionRepository: Repository<Stallion>,
    private horseService: HorsesService,
    private farmService: FarmsService,
    private readonly stallionsService: StallionsService,
  ) {}

  /*
   * Get Stake winners data - by using sire and dam
   */
  async getStakesWinnerComparison(
    searchOptionsDto: SearchStakeWinnerComparisonOptionsDto,
  ) {
    let stallion = await this.stallionsService.getStallionByUuid(
      searchOptionsDto.stallionId,
    );
    let mare = await this.horseService.findHorsesByUuid(
      searchOptionsDto.mareId,
    );
    let sortBy = StakesWinnerComparisionSort.SIMILARITYSCORE;
    if (searchOptionsDto.sortBy) {
      sortBy = searchOptionsDto.sortBy;
    }
    let entities = await this.stallionRepository.manager.query(
      `EXEC Proc_SMPGetStakeWinnersComparision 
                     @sireId=@0,
                     @damId=@1,
                     @level=@2,
                     @page=@3,
                     @size=@4,
                     @excludeSWHorseId=@5,
                     @sortBy=@6`,
      [
        stallion.horseId,
        mare.id,
        5,
        searchOptionsDto.page,
        searchOptionsDto.limit,
        null,
        sortBy,
      ],
    );
    //BOF CODE FOR Pagination - For Proc
    //let offset = (searchOptionsDto.page - 1) * searchOptionsDto.limit;
    //let paginatedItems = entities.slice(offset).slice(0, searchOptionsDto.limit);
    //EOF CODE FOR Pagination - For Proc
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

  /*
   * Get Pedigree overlap data - by using sire, dam and SW
   */
  async getPedigreeOverlapDetails(
    stallionId: string,
    mareId: string,
    swId: string,
    generation: number,
  ) {
    const record = await this.stallionsService.getStallionByUuid(stallionId);
    const mareRecord = await this.horseService.findMareByUuid(mareId);
    const horseRecord = await this.horseService.findHorsesByUuid(swId);

    const finalData = await this.stallionRepository.manager.query(
      `EXEC proc_SMPColorMatchPedigreeHypoSW 
                     @phyposire=@0,
                     @phypodam=@1,
                     @StakeWinnerHorseID=@2,
                     @pgen=@3`,
      [record.horseId, mareRecord.id, horseRecord.id, generation],
    );

    const stallionData = await finalData.filter(
      (res) => res.HypoMating == 'HypoSire',
    );
    const mareData = await finalData.filter(
      (res) => res.HypoMating == 'HypoDam',
    );
    const swData = await finalData.filter(
      (res) => res.HypoMating != 'HypoSire' && res.HypoMating != 'HypoDam',
    );
    //BOF CODE Need to be done in proc_SMPColorMatchPedigreeHypoSW itself
    const swHorse = await finalData.filter(
      (res) => res.HypoMating == 'SWHorse',
    );
    if (swHorse.length) {
      let swSireId = swHorse[0]?.sireId;
      let swDamId = swHorse[0]?.damId;
      let swHorseId = swHorse[0]?.id;
      swData.map(async function (element) {
        if (
          (element.id == swSireId || element.id == swDamId) &&
          element.childId == 0
        ) {
          element.childId = swHorseId;
        }
        return element;
      });
    }
    //EOF CODE Need to be done in proc_SMPColorMatchPedigreeHypoSW itself
    let stallion = await this.horseService.treePedigreeByHorseId(
      record,
      stallionData,
    );
    let mare = await this.horseService.treePedigreeByHorseId(
      mareRecord,
      mareData,
    );
    let stakeWinner = await this.horseService.treePedigreeByHorseId(
      horseRecord,
      swData,
    );
    const response = {
      MatchResult: finalData.length > 0 ? finalData[0].MatchResult : '',
      Stallion: stallion,
      Mare: mare,
      stakeWinner: stakeWinner,
    };

    if (finalData.length) {
      let stallionFarmData = await this.farmService.getFarmLogoByFarmId(
        record.farmId,
      );
      let stallionProfileImageData =
        await this.stallionsService.getStallionProfilePicsByStallionId(
          record.id,
        );
      return {
        stallionFarmLogo: stallionFarmData,
        stallionProfileImageData: stallionProfileImageData,
        ...response,
      };
    }
  }

  /*
   * Get Aptiude, Age and distance data - by using sire, dam
   */
  async getSmsearchProfileDetails(
    searchOptionsDto: SmSearchProfileDetailsOptionsDto,
  ) {
    let stallion = await this.stallionsService.getStallionByUuid(
      searchOptionsDto.stallionId,
    );
    let mare = await this.horseService.findHorsesByUuid(
      searchOptionsDto.mareId,
    );
    let profileData = await this.stallionRepository.manager.query(
      `EXEC Proc_SMPGetHorseAptitudeAgeDistanceProfile 
                     @sireId=@0,
                     @damId=@1,
                     @level=@2`,
      [stallion.horseId, mare.id, 5],
    );
    const ageRecords = await profileData.filter(
      (res) => res.profileType == 'age',
    );
    const distanceRecords = await profileData.filter(
      (res) => res.profileType == 'distance',
    );
    const aptitudeRecords = await profileData.filter(
      (res) => res.profileType == 'aptitude',
    );
    // if (
    //   !ageRecords.length &&
    //   !distanceRecords.length &&
    //   !aptitudeRecords.length
    // ) {
    //   return {
    //     aptitudeProfile: {},
    //     ageProfile: {},
    //     distanceProfile: {},
    //   };
    // }
    //Binding Age and Distance Data
    let ageLabels = ['2 Years', '3 Years', '4 Years', '5 Years', 'Open'];
    let aptitudeLabelsConst = [
      {
        min: 0,
        max: 800,
        lable: '800m (4f)',
      },
      {
        min: 800,
        max: 900,
        lable: '900m (4.5f)',
      },
      {
        min: 900,
        max: 1000,
        lable: '1000m (5f)',
      },
      {
        min: 1000,
        max: 1100,
        lable: '1100m (5.5f)',
      },
      {
        min: 1100,
        max: 1200,
        lable: '1200m (6f)',
      },
      {
        min: 1200,
        max: 1300,
        lable: '1300m (6.5f)',
      },
      {
        min: 1300,
        max: 1400,
        lable: '1400m (7f)',
      },
      {
        min: 1400,
        max: 1500,
        lable: '1500m (7.5f)',
      },
      {
        min: 1500,
        max: 1600,
        lable: '1600m (8f)',
      },
      {
        min: 1600,
        max: 1700,
        lable: '1700m (8.5f)',
      },
      {
        min: 1700,
        max: 1800,
        lable: '1800m (9f)',
      },
      {
        min: 1800,
        max: 1900,
        lable: '1900m (9.5f)',
      },
      {
        min: 1900,
        max: 2000,
        lable: '2000m (10f)',
      },
      {
        min: 2000,
        max: 2100,
        lable: '2100m (10.5f)',
      },
      {
        min: 2100,
        max: 2200,
        lable: '2200m (11f)',
      },
      {
        min: 2200,
        max: 2300,
        lable: '2300m (11.5f)',
      },
      {
        min: 2300,
        max: 2400,
        lable: '2400m (12f)',
      },
      {
        min: 2400,
        max: 2500,
        lable: '2500m (12.5f)',
      },
      {
        min: 2500,
        max: 2600,
        lable: '2600m (13f)',
      },

      {
        min: 2600,
        max: 2700,
        lable: '2700m (13.5f)',
      },
      {
        min: 2700,
        max: 10000,
        lable: '2800m+ (14f)',
      },
    ];
    let distanceLabelsConst = [
      {
        min: 0,
        max: 800,
        lable: '800m (4f)',
      },
      {
        min: 800,
        max: 1200,
        lable: '1200m (6f)',
      },
      {
        min: 1200,
        max: 1600,
        lable: '1600m (8f)',
      },
      {
        min: 1600,
        max: 2000,
        lable: '2000m (10f)',
      },
      {
        min: 2000,
        max: 2400,
        lable: '2400m (12f)',
      },
      {
        min: 2400,
        max: 10000,
        lable: '2800m+ (14f)',
      },
    ];
    let distanceDefaultLabels = [
      '800m (4f)',
      '1200m (6f)',
      '1400m (8f)',
      '2000m (10f)',
      '2400m (12f)',
      '2800m+ (14f)',
    ];
    let ageMales = [];
    let ageFeMales = [];
    let distanceLabels = [];
    let distanceMales = [];
    let distanceFeMales = [];
    let ageProfile = {};
    let distanceProfile = {};
    let aptitudeProfile = {};
    let aptitudeXAxisLabels = [];
    let aptitudeYAxisLabels = ['Open', '3YO', '2YO'];
    let aptitudeHorseIds = [];
    let aptitudeDatasets = [];
    let pointCounts = [];
    await aptitudeRecords.reduce(async (promise, element) => {
      await promise;
      if (element.horseId) {
        if (!aptitudeHorseIds.includes(element.horseId)) {
          aptitudeHorseIds.push(element.horseId);
        }
      }
      let meterPointerRecord = aptitudeLabelsConst.find(
        (o) => element.metre > o.min && element.metre <= o.max,
      );
      let indexOfPointer = pointCounts.findIndex(
        (o) =>
          o.metre === meterPointerRecord.max && o.raceAge === element.raceAge,
      );
      if (indexOfPointer >= 0) {
        pointCounts[indexOfPointer].noOfRecords =
          pointCounts[indexOfPointer].noOfRecords + 1;
      } else {
        pointCounts.push({
          metre: meterPointerRecord.max,
          raceAge: element.raceAge,
          noOfRecords: 1,
        });
      }
    }, Promise.resolve());
    aptitudeYAxisLabels.sort();
    aptitudeYAxisLabels.reverse();
    aptitudeHorseIds.sort();
    if (aptitudeYAxisLabels.length) {
      aptitudeYAxisLabels.push('');
    }
    let aptData = [];
    await aptitudeHorseIds.reduce(async (promise, element, index) => {
      await promise;
      if (element) {
        aptData.push(index);
        aptData[index] = [];
        const horseData = await aptitudeRecords.filter(
          (res) => res.horseId == element,
        );
        await horseData.reduce(async (horsePromise, horseElement) => {
          await horsePromise;
          let meterPointerRecord = aptitudeLabelsConst.find(
            (o) => horseElement.metre > o.min && horseElement.metre <= o.max,
          );
          if (horseElement.horseId && meterPointerRecord) {
            let pointerRecords = [];
            let rValue = 0;
            if (horseElement.raceAge > 3) {
              pointerRecords = pointCounts.filter(
                (o) => o.metre === meterPointerRecord.max && o.raceAge > 3,
              );
            } else {
              pointerRecords = pointCounts.filter(
                (o) =>
                  o.metre === meterPointerRecord.max &&
                  o.raceAge === horseElement.raceAge,
              );
            }
            if (pointerRecords.length === 1) {
              rValue = pointerRecords[0].noOfRecords * 5;
            } else {
              rValue = pointerRecords.length * 5;
            }
            aptData[index].push({
              x: meterPointerRecord.lable,
              y:
                horseElement.raceAge == 2 || horseElement.raceAge == 3
                  ? horseElement.raceAge + 'YO'
                  : 'Open',
              r: rValue,
              stake: horseElement.stake,
              horseName: horseElement.horseName,
            });
          }
        }, Promise.resolve());
      }
    }, Promise.resolve());

    await aptitudeHorseIds.reduce(async (promise, element, index) => {
      await promise;
      if (element) {
        aptitudeDatasets.push(index);
        aptitudeDatasets[index] = {
          label: aptData[index][0]['horseName'],
          backgroundColor: 'rgba(29 71 46)',
          hoverRadius: 0,
          data: aptData[index],
        };
      }
    }, Promise.resolve());
    //Binding Age Data
    await ageLabels.reduce(async (promise, element) => {
      await promise;
      const ageData = await ageRecords.filter(
        (res) =>
          (res.raceAge >= 2 && res.raceAge <= 5
            ? res.raceAge + ' Years'
            : 'Open') == element,
      );
      if (ageData.length > 0) {
        if (element != 'Open') {
          if (ageData.length == 1) {
            if (ageData[0].sex == 'M') {
              ageMales.push(ageData[0].totalCount);
              ageFeMales.push(0);
            }
            if (ageData[0].sex == 'F') {
              ageFeMales.push(ageData[0].totalCount);
              ageMales.push(0);
            }
          } else {
            await ageData.reduce(async (promise, rec) => {
              await promise;
              if (rec.sex == 'M') {
                ageMales.push(rec.totalCount);
              }
              if (rec.sex == 'F') {
                ageFeMales.push(rec.totalCount);
              }
            }, Promise.resolve());
          }
        } else {
          await ageData.reduce(async (promise, rec) => {
            await promise;
            if (typeof ageMales[4] === 'undefined') {
              ageMales.push(0);
              ageFeMales.push(0);
            }
            if (rec.sex == 'M') {
              ageMales[4] = ageMales[4] + rec.totalCount;
            }
            if (rec.sex == 'F') {
              ageFeMales[4] = ageFeMales[4] + rec.totalCount;
            }
          }, Promise.resolve());
        }
      } else {
        ageMales.push(0);
        ageFeMales.push(0);
      }
    }, Promise.resolve());
    //Binding Distance Data
    await distanceLabelsConst.reduce(async (promise, element) => {
      await promise;
      const distanceData = await distanceRecords.filter(
        (res) => res.metre > element.min && res.metre <= element.max,
      );
      if (distanceData.length > 0) {
        if (distanceData.length == 1) {
          if (distanceData[0].sex == 'M') {
            distanceMales.push(distanceData[0].totalCount);
            distanceFeMales.push(0);
          }
          if (distanceData[0].sex == 'F') {
            distanceFeMales.push(distanceData[0].totalCount);
            distanceMales.push(0);
          }
        } else {
          let distanceMalesCnt = 0;
          let distanceFeMalesCnt = 0;
          await distanceData.reduce(async (promise, rec) => {
            await promise;
            if (rec.sex == 'M') {
              distanceMalesCnt = distanceMalesCnt + rec.totalCount;
            }
            if (rec.sex == 'F') {
              distanceFeMalesCnt = distanceFeMalesCnt + rec.totalCount;
            }
          }, Promise.resolve());
          distanceMales.push(distanceMalesCnt);
          distanceFeMales.push(distanceFeMalesCnt);
        }
      } else {
        distanceMales.push(0);
        distanceFeMales.push(0);
      }
    }, Promise.resolve());

    let finalDistanceLabels = [];
    await distanceLabelsConst.reduce(async (promise, element) => {
      await promise;
      finalDistanceLabels.push(element.lable);
    }, Promise.resolve());
    if (ageFeMales.length) {
      ageProfile = {
        labels: ageLabels,
        datasets: [
          {
            label: 'Female',
            data: (ageFeMales.every((value) => value === 0))? []: ageFeMales,
            backgroundColor: 'rgba(239, 198, 223, 0.24)',
            borderColor: 'rgba(237, 138, 197, 1)',
            borderWidth: 2,
          },
          {
            label: 'Male',
            data: (ageMales.every((value) => value === 0))? []: ageMales,
            backgroundColor: 'rgba(197, 217, 240, 0.24)',
            borderColor: 'rgba(139, 186, 240, 1)',
            borderWidth: 2,
          },
        ],
      };
    }
    if (distanceFeMales.length) {
      distanceProfile = {
        labels: finalDistanceLabels,
        datasets: [
          {
            label: 'Female',
            data: (distanceFeMales.every((value) => value === 0))? []: distanceFeMales,
            backgroundColor: 'rgba(239, 198, 223, 0.24)',
            borderColor: 'rgba(237, 138, 197, 1)',
            borderWidth: 2,
          },
          {
            label: 'Male',
            data: (distanceMales.every((value) => value === 0))? []: distanceMales,
            backgroundColor: 'rgba(197, 217, 240, 0.24)',
            borderColor: 'rgba(139, 186, 240, 1)',
            borderWidth: 2,
          },
        ],
      };
    } else {
      distanceProfile = {
        labels: finalDistanceLabels,
        datasets: [
          {
            label: 'Female',
            data: [],
            backgroundColor: 'rgba(239, 198, 223, 0.24)',
            borderColor: 'rgba(237, 138, 197, 1)',
            borderWidth: 2,
          },
          {
            label: 'Male',
            data: [],
            backgroundColor: 'rgba(197, 217, 240, 0.24)',
            borderColor: 'rgba(139, 186, 240, 1)',
            borderWidth: 2,
          },
        ],
      };
    }
    await aptitudeLabelsConst.reduce(async (promise, element) => {
      await promise;
      aptitudeXAxisLabels.push(element.lable);
    }, Promise.resolve());
    if (aptitudeXAxisLabels.length) {
      aptitudeProfile = {
        aptitudeXAxisLabels,
        aptitudeYAxisLabels,
        aptitudeDatasets,
      };
    }
    return {
      aptitudeProfile: aptitudeProfile,
      ageProfile: ageProfile,
      distanceProfile: distanceProfile,
    };
  }

  /*
   * Get Alternate mating suggestions - by using sire, dam
   */
  async getAlternateMatingSuggestions(
    searchOptionsDto: AlternateMatingSuggestionsDto,
  ) {
    let stallion = await this.stallionsService.getStallionByUuid(
      searchOptionsDto.stallionId,
    );
    let mare = await this.horseService.findHorsesByUuid(
      searchOptionsDto.mareId,
    );
    let entities = await this.stallionRepository.manager.query(
      `EXEC proc_AlternateMatingSuggessions 
        @phypoStallionid=@0,
        @phypodam=@1`,
      [stallion.id, mare.id],
    );
    let data = [];
    await entities.map(async function (element, index) {
      let isThunder = 0;
      let isHot = 0;
      if (element.MatchResult == '20/20 MATCH') {
        isThunder = 1;
      }
      if (element.MatchResult == 'PERFECT MATCH') {
        isHot = 1;
      }
      data.push({
        stallionId: element.stallionUuid,
        horseName: element.horsename,
        yob: element.yob,
        farmName: element.farmName,
        farmCountry: element.CountryName,
        farmState: element.stateName,
        currencySymbol: element.currencySymbol,
        currencyCode: element.currencyCode,
        fee: element.fee,
        feeYear: element.feeYear,
        profilePic: element.profilePic,
        isThunder,
        isHot,
      });
    });
    return data;
  }
}
