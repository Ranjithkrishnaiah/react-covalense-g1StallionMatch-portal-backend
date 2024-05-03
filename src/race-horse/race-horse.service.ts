import {
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { HorsesService } from 'src/horses/horses.service';
import { StakesWinnerComparisionSort } from 'src/utils/constants/stallions';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Repository } from 'typeorm';
import { SearchStakeWinnerComparisonOptionsDto } from './dto/search-stake-winner-comparison-options.dto';
import { RaceHorse } from './entities/race-horse.entity';
import { SmSearchProfileDetailsOptionsDto } from './dto/sm-search-profile-details-options.dto';
import { RaceHorseNameSearchDto } from './dto/race-horse-name-search.dto';
import { CountryService } from 'src/country/service/country.service';
import { ValidateRaceHorseUrlDto } from './dto/validate-race-horse-url.dto';

@Injectable({ scope: Scope.REQUEST })
export class RaceHorseService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RaceHorse)
    private raceHorseRepository: Repository<RaceHorse>,
    private readonly horsesService: HorsesService,
    private readonly countryService: CountryService,
  ) {}

  //Validate Race Horse Url
  // async validateRaceHorseUrl(horseUuid: string) {
  //   try {
  //     const horseRecord = await this.horsesService.findHorsesByUuid(horseUuid);
  //     const record = await this.raceHorseRepository.findOneOrFail({
  //       horseId: horseRecord.id,
  //       isActive: true,
  //     });
  //     if (!record) {
  //       throw new UnprocessableEntityException('Race Horse not exist!');
  //     }
  //     return await this.horsesService.getHorsePedigree(horseUuid);
  //   } catch (err) {
  //     throw new UnprocessableEntityException(err);
  //   }
  // }

  //Get a Race Horse Pedigree
  async getRaceHorsePedigree(horseUuid: string) {
    try {
      const record = await this.isValidRaceHorse(horseUuid)
      return await this.horsesService.getHorsePedigree(record.horseUuid);
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  /*
   * Get Stake winners data - by using a horse sire and dam
   */
  async getStakesWinnerComparison(
    searchOptionsDto: SearchStakeWinnerComparisonOptionsDto,
  ) {
    try {
      const horseRecord = await this.isValidRaceHorse(searchOptionsDto.horseId)
      let sortBy = StakesWinnerComparisionSort.SIMILARITYSCORE;
      if (searchOptionsDto.sortBy) {
        sortBy = searchOptionsDto.sortBy;
      }
      let entities = await this.raceHorseRepository.manager.query(
        `EXEC Proc_SMPGetStakeWinnersComparision 
                     @sireId=@0,
                     @damId=@1,
                     @level=@2,
                     @page=@3,
                     @size=@4,
                     @excludeSWHorseId=@5,
                     @sortBy=@6`,
        [
          horseRecord.sireId,
          horseRecord.damId,
          5,
          searchOptionsDto.page,
          searchOptionsDto.limit,
          horseRecord.id,
          sortBy,
        ],
      );
      const records = await entities.filter(
        (res) => res.filterType == 'record',
      );
      const countRecord = await entities.filter(
        (res) => res.filterType == 'total',
      );
      const pageMetaDto = new PageMetaDto({
        itemCount: countRecord[0].totalRecords,
        pageOptionsDto: searchOptionsDto,
      });
      return new PageDto(records, pageMetaDto);
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  /*
   * Get Aptiude, Age and distance data - by using sire, dam
   */
  async getSmsearchProfileDetails(
    searchOptionsDto: SmSearchProfileDetailsOptionsDto,
  ) {
    let horseRecord = await this.isValidRaceHorse(
      searchOptionsDto.horseId,
    );
    let profileData = await this.raceHorseRepository.manager.query(
      `EXEC Proc_SMPGetHorseAptitudeAgeDistanceProfile 
                     @sireId=@0,
                     @damId=@1,
                     @level=@2`,
      [horseRecord.sireId, horseRecord.damId, 5],
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
   * Get Pedigree overlap data - by using sire, dam and SW
   */
  async getPedigreeOverlapDetails(
    horseId: string,
    swId: string,
    generation: number,
  ) {
    const raceHorseRecord = await this.isValidRaceHorse(horseId)
    const record = await this.horsesService.findHorseById(raceHorseRecord.sireId);
    const mareRecord = await this.horsesService.findHorseById(raceHorseRecord.damId);
    const horseRecord = await this.horsesService.findHorsesByUuid(swId);

    const finalData = await this.raceHorseRepository.manager.query(
      `EXEC proc_SMPColorMatchPedigreeHypoSW 
                     @phyposire=@0,
                     @phypodam=@1,
                     @StakeWinnerHorseID=@2,
                     @pgen=@3`,
      [record.id, mareRecord.id, horseRecord.id, generation],
    );

    let rhPedigreeData = await finalData.filter(
      (res) => res.HypoMating == 'HypoSire' || res.HypoMating == 'HypoDam',
    );
    await rhPedigreeData.map(async function (item) {
      if (item.generation == 1) {
        item.childId = raceHorseRecord.id
      }
    })
    let horseTag = await this.raceHorseRepository.manager.query(
      `EXEC proc_HorseInfoInPedigree @phorseId=@0`,
      [raceHorseRecord.id],
    );

    let horseInfoTag = null;
    let horseInfoInFullTag = null;
    if (horseTag.length) {
      horseInfoTag = horseTag[0].FirstTag;
      horseInfoInFullTag = horseTag[0].FirstTaginFull;
    }

    //RaceHorse Flags
    let isRaceHorse = 0
    let raceHorseUrl = null
    let raceHorse = await this.raceHorseRepository.manager.query(
      `EXEC procGetRaceHorseByHorseId @horseId=@0`,
      [raceHorseRecord.horseUuid],
    );
    if (raceHorse.length) {
      raceHorseUrl = raceHorse[0].raceHorseUrl
      isRaceHorse = 1
    }
    let horseCountryCode = null;
      const horseCountry = await this.countryService.findByCountryId(
        raceHorseRecord.countryId,
      );
      if (horseCountry) {
        horseCountryCode = horseCountry.countryCode;
      }
    let rhRecord = 
      [
        {
          "HypoMating": null,
          "id": raceHorseRecord.id,
          "horseId": "80E56941-5AC8-ED11-8D8B-E8D8D1C4DF34",
          "childId": 0,
          "hp": null,
          "generation": 0,
          "sireId": raceHorseRecord.sireId,
          "damId": raceHorseRecord.damId,
          "ColorCoding": null,
          "horseName": raceHorseRecord.horseName,
          "yob": raceHorseRecord.yob,
          "cob": horseCountryCode,
          "sex": raceHorseRecord.sex,
          "isRaceHorse": isRaceHorse,
          "raceHorseUrl": raceHorseUrl,
          "Info": horseInfoTag,
          "InfoinFull": horseInfoInFullTag,
          "FirstInfo": horseInfoTag,
          "FirstInfoinFull": horseInfoInFullTag
        },
      ]
    ;
    rhPedigreeData = rhRecord.concat(rhPedigreeData);
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
    let raceHorsePedigree = await this.horsesService.treePedigreeByHorseId(
      raceHorseRecord,
      rhPedigreeData,
    );
    // let mare = await this.horsesService.treePedigreeByHorseId(
    //   mareRecord,
    //   mareData,
    // );
    let stakeWinner = await this.horsesService.treePedigreeByHorseId(
      horseRecord,
      swData,
    );
    const response = {
      raceHorse: raceHorsePedigree,
      stakeWinner: stakeWinner,
    };

    if (finalData.length) {
      return {
        ...response,
      };
    }
  }

  /* Get Race Horses By Name */
  async getRaceHorseByName(
    searchDto: RaceHorseNameSearchDto,
  ) {
    const finalData = await this.raceHorseRepository.manager.query(
      `EXEC procSearchRaceHorseByName 
      @raceHorseName=@0`,
      [searchDto.raceHorseName,],
    );
    return finalData;
  }

  //Validate a Race Horse and return Horse Data
  async isValidRaceHorse(horseUuid: string) {
    try {
      const horseRecord = await this.horsesService.findHorsesByUuid(horseUuid);
      const record = await this.raceHorseRepository.findOneOrFail({
        horseId: horseRecord.id,
        isActive: true,
      });
      if (!record) {
        throw new UnprocessableEntityException('Race Horse not exist!');
      }
      return horseRecord
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  //Validate a Race Horse Url and return Horse Data
  async validateRaceHorseUrl(data: ValidateRaceHorseUrlDto) {
    try {
      const horseRecord = await this.horsesService.findHorsesByUuid(data.horseId);
      const record = await this.raceHorseRepository.findOneOrFail({
        horseId: horseRecord.id,
        raceHorseUrl: data.slug, 
        isActive: true,
      });
      if (!record) {
        throw new NotFoundException('Race Horse not exist!');
      }
      return horseRecord
    } catch (err) {
      throw new NotFoundException('Race Horse not exist!');
    }
  }
}
