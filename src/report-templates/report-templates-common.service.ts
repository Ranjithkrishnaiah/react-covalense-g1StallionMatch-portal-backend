import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository} from '@nestjs/typeorm';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesService } from 'src/horses/horses.service';
import { StakesWinnerComparisionSort } from 'src/utils/constants/stallions';
import { Repository, getRepository } from 'typeorm';
import { HtmlToPdfService } from './html-to-pdf.service';
import { ReportSalesCatelogueService } from './report-sales-catelogue.service';
import { ReportStallionShortlistService } from './report-stallion-shortlist.service';
import { Stallion } from 'src/stallions/entities/stallion.entity';

@Injectable()
export class ReportTemplatesCommonService {
  constructor(
    @InjectRepository(Horse)
    readonly horseRepository: Repository<Horse>,
    readonly htmlToPdfService: HtmlToPdfService,
    readonly horsesService: HorsesService,
    readonly commonUtilsService: CommonUtilsService,
    readonly fileUploadsService: FileUploadsService,
    readonly configService: ConfigService,
    readonly reportShortlistService: ReportStallionShortlistService,
    readonly reportSalesCatelogueService: ReportSalesCatelogueService,
  ) {}

  async getStakesWinnerComparison(
    sireId,
    damId,
    page,
    limit,
    sortBy = StakesWinnerComparisionSort.SIMILARITYSCORE,
    excludeRaceHorseId = null,
  ) {
    let entities = []
    if (excludeRaceHorseId) {
      entities = await this.horseRepository.manager.query(
        `EXEC Proc_SMPGetStakeWinnersComparision 
                      @sireId=@0,
                      @damId=@1,
                      @level=@2,
                      @page=@3,
                      @size=@4,
                      @excludeSWHorseId=@5,
                      @sortBy=@6`,
        [sireId, damId, 5, page, limit, excludeRaceHorseId, sortBy],
      );
    } else {
      entities = await this.horseRepository.manager.query(
        `EXEC Proc_SMPGetStakeWinnersComparision 
                      @sireId=@0,
                      @damId=@1,
                      @level=@2,
                      @page=@3,
                      @size=@4,
                      @excludeSWHorseId=@5,
                      @sortBy=@6`,
        [sireId, damId, 5, page, limit, null, sortBy],
      );
    }
    const records = await entities.filter((res) => res.filterType == 'record');
    await records.map(async (element) => {
      element.Horsename = await this.commonUtilsService.toTitleCase(
        element.Horsename,
      );
      element.CSI = Math.round(element.CSI);
      element.g1 = element.g1 ? element.g1 : 0;
      element.g2 = element.g2 ? element.g2 : 0;
      element.g3 = element.g3 ? element.g3 : 0;
      return element;
    });
    return records;
  }

  async getAptitudeAgeAndDistanceProfiles(sireId, damId, excludeRaceHorseId=null) {
    let profileData = []
    if (excludeRaceHorseId) {
      profileData = await this.horseRepository.manager.query(
        `EXEC Proc_SMPGetHorseAptitudeAgeDistanceProfile 
                       @sireId=@0,
                       @damId=@1,
                       @level=@2,
                       @excludeSWHorseId=@3`,
        [sireId, damId, 5, excludeRaceHorseId],
      );
    } else {
      profileData = await this.horseRepository.manager.query(
        `EXEC Proc_SMPGetHorseAptitudeAgeDistanceProfile 
                       @sireId=@0,
                       @damId=@1,
                       @level=@2`,
        [sireId, damId, 5],
      );
    }
    const ageRecords = await profileData.filter(
      (res) => res.profileType == 'age',
    );
    const distanceRecords = await profileData.filter(
      (res) => res.profileType == 'distance',
    );
    const aptitudeRecords = await profileData.filter(
      (res) => res.profileType == 'aptitude',
    );
    const avgAgeRecord = await profileData.filter(
      (res) => res.profileType == 'avgAge',
    );
    const avgDistanceRecord = await profileData.filter(
      (res) => res.profileType == 'avgDistance',
    );
    // NOTE: Don't enable - cause issue while report generations
    // if (!ageRecords.length && !distanceRecords.length && !aptitudeRecords.length) {
    //   return {
    //     aptitudeProfile: {},
    //     ageProfile: {},
    //     distanceProfile: {},
    //     avgAge: null,
    //     avgDistance: null
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
    //let aptitudeMetreAxisLabels = []
    let aptitudeXAxisLabels = [];
    let aptitudeYAxisLabels = ['Open', '3YO', '2YO'];
    let aptitudeHorseIds = [];
    let aptitudeDatasets = [];
    let pointCounts = [];
    let avgAge = null;
    let avgDistance = null;
    if (avgAgeRecord.length) {
      avgAge = Math.round(avgAgeRecord[0].raceAge);
    }
    if (avgDistanceRecord.length) {
      avgDistance = Math.round(avgDistanceRecord[0].metre);
    }
    await aptitudeRecords.reduce(async (promise, element) => {
      await promise;
      /* if (!aptitudeMetreAxisLabels.includes(element.metre)) {
        aptitudeMetreAxisLabels.push(element.metre)
      } */
      //if (!aptitudeYAxisLabels.includes(element.raceAge)) {
      //aptitudeYAxisLabels.push(element.raceAge)
      //}
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
    //aptitudeMetreAxisLabels.sort();
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
            //console.log('pointerRecords', pointerRecords)
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

    /* await ageRecords.map(async (element) => {
      if (!ageLabels.includes(element.raceAge)) {
        ageLabels.push(element.raceAge)
      }
    })
    await distanceRecords.map(async (element) => {
      if (!distanceLabels.includes(element.metre)) {
        distanceLabels.push(element.metre)
      }
    }) */
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
            label: 'Dam Side',
            data: ageFeMales.every((value) => value === 0) ? [] : ageFeMales,
            backgroundColor: 'rgba(239, 198, 223, 0.24)',
            borderColor: 'rgba(237, 138, 197, 1)',
            borderWidth: 2,
          },
          {
            label: 'Sire Side',
            data: ageMales.every((value) => value === 0) ? [] : ageMales,
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
            label: 'Dam Side',
            data: distanceFeMales.every((value) => value === 0)
              ? []
              : distanceFeMales,
            backgroundColor: 'rgba(239, 198, 223, 0.24)',
            borderColor: 'rgba(237, 138, 197, 1)',
            borderWidth: 2,
          },
          {
            label: 'Sire Side',
            data: distanceMales.every((value) => value === 0)
              ? []
              : distanceMales,
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
            label: 'Dam Side',
            data: [],
            backgroundColor: 'rgba(239, 198, 223, 0.24)',
            borderColor: 'rgba(237, 138, 197, 1)',
            borderWidth: 2,
          },
          {
            label: 'Sire Side',
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
      avgAge,
      avgDistance,
    };
  }

  async getAlternateMatingSuggestions(stallionId: number, mareId: number) {
    let entities = await this.horseRepository.manager.query(
      `EXEC proc_AlternateMatingSuggessions 
        @phypoStallionid=@0,
        @phypodam=@1`,
      [stallionId, mareId],
    );
    let data = [];
    let self = this;
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
        horseName: await self.commonUtilsService.toTitleCase(element.horsename),
        yob: element.yob,
        farmName: await self.commonUtilsService.toTitleCase(element.farmName),
        farmCountry: element.CountryName,
        farmState: element.stateName,
        currencySymbol: element.currencySymbol,
        currencyCode: element.currencyCode,
        fee: element.fee ? element.fee.toLocaleString() : null,
        feeYear: element.feeYear,
        profilePic: element.profilePic,
        isThunder,
        isHot,
      });
    });
    return data;
  }

  async getTopPerformingSireLines(stallionIds) {
    let sireLinesData = [];
    let result = await this.horseRepository.manager.query(
      `EXEC proc_TopPerformingSireLines 
                     @pStallionId=@0`,
      [stallionIds],
    );
    let strikeRateRanges = await this.horseRepository.manager.query(
      `EXEC Proc_SMPGetMareStrikeRateRangeByPosition 
        @pPosition=@0`,
      ['S'],
    );
    await result.reduce(async (promise, item) => {
      await promise;
      sireLinesData.push({
        horseName: item.horseName,
        g1Winners: item.G1Winners,
        stakesWinners: item.StakeWinners,
        runners: item.Runners,
        g1RnrsPercent: item.G1RunnerPerc,
        sWsRnrsPercent: item.SWRunnerPerc,
        colour: await this.getColourForTopPerformingSireLines(
          item.SWRunnerPerc,
          strikeRateRanges,
        ),
      });
    }, Promise.resolve());
    return sireLinesData;
  }

  async getColourForTopPerformingSireLines(strikeRate, srRanges) {
    let record = srRanges.filter(
      (item) => strikeRate >= item.minValue && strikeRate <= item.maxValue,
    );
    if (!record.length) {
      return 'grey';
    }
    switch (record[0].position) {
      case 'top10':
        return 'brick';
      case 'top30':
        return 'green';
      case 'bottom30':
        return 'orange';
      default:
        return 'grey';
    }
  }

  async getStallionFarmAndLocationsByStallionIds(stallionIds) {
    let farmsData = await this.horseRepository.manager.query(
      `EXEC Proc_SMPGetStallionFarmAndLocationByStallionIds 
                     @stallionIds=@0`,
      [stallionIds],
    );
    let data = {
      farmsIncluded: '',
      locations: '',
      item: '',
    };
    let farmNames = [];
    let farmLocations = [];
    let farmCountry = [];
    await farmsData.reduce(async (promise, farmData) => {
      await promise;
      if (!farmNames.includes(farmData.farmName)) {
        farmNames.push(farmData.farmName);
      }
      if (!farmLocations.includes(farmData.stateName)) {
        farmLocations.push(farmData.stateName);
      }
      if (!farmCountry.includes(farmData.countryName)) {
        farmCountry.push(farmData.countryName);
      }
    }, Promise.resolve());
    data.farmsIncluded = await this.commonUtilsService.toTitleCase(
      farmNames.join(', '),
    );
    data.locations = farmLocations.join(', ');
    if (data.locations) {
      data.locations =
        (await this.commonUtilsService.toTitleCase(data.locations)) +
        ', ' +
        farmCountry.join(', ')
    } else {
      data.locations = farmCountry.join(', ')
    }

    const locationData = await this.setLocations(data.locations,data.farmsIncluded);
    data.locations = locationData?.stallionLocation;
    data.farmsIncluded = locationData?.farmsIncluded;
    data.item = locationData?.item;
    
    return data;
  }

  async getShortListStallionsByStallionIds(horseId, stallionIds) {
    let result = await this.horseRepository.manager.query(
      `EXEC Proc_SMPGetShortListStallionsByStallionIds 
                     @stallionIds=@0`,
      [stallionIds],
    );
    for (const element of result) {
      await this.getElementData(element, horseId);
    }
    return result;
  }

  async getElementData(element, horseId) {
    element.horseName = await this.commonUtilsService.toTitleCase(
      element.horseName,
    );
    element.farmName = await this.commonUtilsService.toTitleCase(
      element.farmName,
    );
    element.fee = `${element.currencyCode} ${
      element.currencySymbol
    }${element.fee.toLocaleString()}`;
    element.pedigree = await this.horsesService.getHypoMatingDetails(
      element.horseId,
      horseId,
      5,
    );
    element.graphs = await this.getAptitudeAgeAndDistanceProfiles(
      element.horseId,
      horseId,
    );
    element.stakeWinners = await this.getStakesWinnerComparison(
      element.horseId,
      horseId,
      1,
      15,
    );
    element.successProfile =
      await this.reportShortlistService.getSuccessProfile(
        element.stallionId,
        horseId,
      );
    let matchResult = null;
    if (element.pedigree[0][0].matchResult == '2020M') {
      matchResult = '20/20 Match';
    } else if (element.pedigree[0][0].matchResult == 'PM') {
      matchResult = 'Perfect Match';
    }
    element.stallionMatch = matchResult;
    element.rating = await this.getStallionProfileRating(element);
    let avgDistance = element.graphs.avgDistance;
    let avgAge = element.graphs.avgAge;
    let profileString = '';
    if (avgAge) {
      profileString = `Open`;
      if (avgAge >= 2 && avgAge <= 5) {
        profileString = `${avgAge}YO`;
      }
    }
    if (avgDistance >= 1000 && avgDistance < 1400) {
      profileString = `${profileString} Speed`;
    } else if (avgDistance >= 1400 && avgDistance < 1900) {
      profileString = `${profileString} Miler`;
    } else if (avgDistance >= 2000 && avgDistance < 2800) {
      profileString = `${profileString} Middle Distance`;
    } else if (avgDistance >= 2800) {
      profileString = `${profileString} Stayer`;
    }
    element.profile = profileString;
    return await element;
  }

  async getStallionProfileRating(data) {
    const totalRequiredFields = 13;
    const completePercentage = 100;
    let completedCount = 0;
    let profileRating = 0;
    const dataCheck = {
      profilePic: data.profilePic,
      horseName: data.horseName,
      farmName: data.farmName,
      yob: data.yob,
      colourName: data.colourName,
      fee: data.fee,
      feeYear: data.feeYear,
      countryCode: data.countryCode,
      yearToStud: data.yearToStud,
      height: data.height,
      overview: data.overview,
      //testimonialCount: data.testimonialCount,
      //sgiCount: data.sgiCount
    };
    for (let value of Object.values(dataCheck)) {
      if (value) completedCount++;
    }
    if (data.testimonialCount === 3) {
      completedCount++;
    }
    if (data.sgiCount === 8) {
      completedCount++;
    }
    if (completedCount) {
      profileRating = Number(
        ((completedCount / totalRequiredFields) * completePercentage).toFixed(
          2,
        ),
      );
      profileRating = Math.round(profileRating);
    }
    return profileRating;
  }

  async getSuccessProfileStrikeRateRanges() {
    let result = await this.horseRepository.manager.query(
      `EXEC Proc_SMPGetStallionStrikeRateRangeForSuccessProfile`,
    );
    return result;
  }

  async getColourCodeForSuccessProfile(strikeRate, srRanges) {
    let record = srRanges.filter(
      (item) => strikeRate >= item.minValue && strikeRate <= item.maxValue,
    );
    if (!record.length) {
      return 'white';
    }
    switch (record[0].position) {
      case 'top10':
        return 'gold';
      case 'top30':
        return 'green';
      case 'bottom30':
        return 'orange';
      default:
        return 'white';
    }
  }

  async getShortlistSummaryList(stallionAnalysisSummary) {
    const firstPageData = stallionAnalysisSummary.splice(0, 25);
    let summaryFirstPage = await this.commonUtilsService.arrayToChunks(
      firstPageData,
      25,
    );
    if (stallionAnalysisSummary.length <= 25) {
      return summaryFirstPage;
    }
    let summaryNextPages = await this.commonUtilsService.arrayToChunks(
      stallionAnalysisSummary,
      30,
    );
    let stallionAnalysisSummaryList = summaryFirstPage.concat(summaryNextPages);
    return stallionAnalysisSummaryList;
  }

  async getStallionsPriceRangeByStallionIds(currencyCode = 'AUD', stallionIds) {
    let result = await this.horseRepository.manager.query(
      `EXEC Proc_SMPGetStallionsPriceRangeByStallionIds 
      @destCurrencyCode=@0,
      @stallionIds=@1`,
      [currencyCode, stallionIds],
    );
    if (result.length) {
      return `${currencyCode} $${result[0].minPrice.toLocaleString()} - ${currencyCode} $${result[0].maxPrice.toLocaleString()}`;
    }
    return '';
  }

  async getSalesLotsByHorseIds(horseIds, countryId, saleReportType, stallionId) {
    let salesLotsInfoArr = [];
    for (const element of horseIds) {
      const elementData = await this.reportSalesCatelogueService.findLotInfo(
        element
      );
      if(saleReportType==2 && elementData){
        const stallion = await getRepository(Stallion)
        .createQueryBuilder('stallion')
        .select('stallion.id as id')
        .select('horse.id as horseId,horse.horseName stallionName')
        .innerJoin('stallion.horse','horse')
        .andWhere('stallion.id = :stallionUuid', {
          stallionUuid: stallionId,
        })
        .getRawOne();
        elementData.sireId=stallion.horseId
        elementData.sireName=stallion.stallionName
        elementData.damId=elementData.horseId
        elementData.damName=elementData.horseName
      }
      const getSalesElementData = await this.getSalesElementData(
        elementData,
        countryId
      );
      salesLotsInfoArr.push(getSalesElementData);
    }
    return salesLotsInfoArr;
  }

  async getSalesElementData(element, countryId) {
    console.log('element',element)
    // element.horseName = await this.commonUtilsService.toTitleCase(
    //   element.horseName,
    // );
    // element.lotType = await this.commonUtilsService.toTitleCase(
    //   element.lotType,
    // );
    // element.fee = `${element.currencyCode} ${element.currencySymbol}${(element.fee).toLocaleString()}`
   
    element.pedigree = await this.horsesService.getHypoMatingDetails(
      element.sireId,
      element.damId,
      5,
    );
    element.graphs = await this.getAptitudeAgeAndDistanceProfiles(
      element.sireId,
      element.damId,
    );
    element.stakeWinners = await this.getStakesWinnerComparison(
      element.sireId,
      element.damId,
      1,
      15,
    );
    element.successProfile =
      await this.reportShortlistService.getSuccessProfile(
        element.sireId,
        element.damId,
      );
        
    let matchResult = null;
    if (element.pedigree[0][0].matchResult == '2020M') {
      matchResult = '20/20 Match';
    } else if (element.pedigree[0][0].matchResult == 'PM') {
      matchResult = 'Perfect Match';
    }
    element.stallionMatch = matchResult;
    element.rating = await this.getStallionProfileRating(element);
    element.impactProfile =
      await this.reportSalesCatelogueService.getImpactProfile(
        element.horseId,
        countryId,
      );
    let avgDistance = element.graphs.avgDistance;
    let avgAge = element.graphs.avgAge;
    let profileString = '';
    if (avgAge) {
      profileString = `Open`;
      if (avgAge >= 2 && avgAge <= 5) {
        profileString = `${avgAge}YO`;
      }
    }
    if (avgDistance >= 1000 && avgDistance < 1400) {
      profileString = `${profileString} Speed`;
    } else if (avgDistance >= 1400 && avgDistance < 1900) {
      profileString = `${profileString} Miler`;
    } else if (avgDistance >= 2000 && avgDistance < 2800) {
      profileString = `${profileString} Middle Distance`;
    } else if (avgDistance >= 2800) {
      profileString = `${profileString} Stayer`;
    }
    element.profile = profileString;
    return await element;
  }

  async setSireDamGrandSireGrandDamSire(data) {
    let result = {};
    for (let item of data) {
      if (item.includes(' (S)'))
        result['column3'] = item.replace(' (S)', '').toUpperCase();
      else if (item.includes(' (SS)'))
        result['column4'] = item.replace(' (SS)', '').toUpperCase();
      else if (item.includes(' (DS)'))
        result['column5'] = item.replace(' (DS)', '').toUpperCase();
      else if (item.includes(' (DSS)'))
        result['column6'] = item.replace(' (DSS)', '').toUpperCase();
    }
    return result;
  }

  async getColourForAncestorsAffinityComponents(strikeRate, srRanges) {
    let record = srRanges.filter(
      (item) => strikeRate >= item.minValue && strikeRate <= item.maxValue,
    );
    if (!record.length) {
      return 'white';
    }
    switch (record[0].position) {
      case 'top10':
        return 'gold';
      case 'top30':
        return 'green';
      case 'bottom30':
        return 'orange';
      default:
        return 'white';
    }
  }

  async setLocations(stallionsLocation,farmAndLocations){
    // Testing
    // stallionsLocation = 'New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, adfaf kjdk fkjdf , kjdkf ,a djkf hdkf, jhkdfk f, fjkdfh la, jdhgfjkas. New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, adfaf kjdk fkjdf , kjdkf ,a djkf hdkf, jhkdfk f, fjkdfh la, jdhgfjkas.'
    // farmAndLocations = 'FArmmmmmmmmm Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New Yorkvvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New Yorkvvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New Yorkvvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New Yorkvvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New Yorkvvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York'
    
    let stalionLocations = '';
    let farmsIncluded = '';
    let tempStallionLocations = stallionsLocation.split('');
    let tempFarmLocations = farmAndLocations.split('');
    let item = '';
    let slice;
    let length = 0;
    let pathReportTemplateStyles= this.configService.get('file.pathReportTemplateStylesAdmin');
    if(tempStallionLocations.length < 930){
      slice = tempStallionLocations.slice(0,tempStallionLocations.length);
      stalionLocations = slice.join('');
      
      slice = tempFarmLocations.slice(0,(665 - tempStallionLocations.length));
      farmsIncluded = slice.join('');

      tempStallionLocations.splice(0,tempStallionLocations.length);
      tempFarmLocations.splice(0,(665 - tempStallionLocations.length));
      if(tempFarmLocations.length){
        item = await this.appendFarmsInclude(item,tempFarmLocations,pathReportTemplateStyles,length,false);
      }
    }else{
      slice = tempStallionLocations.slice(0,930);
      tempStallionLocations.splice(0,930);
      stalionLocations = slice.join('');
      while(tempStallionLocations.length > 1850){
        slice = tempStallionLocations.slice(0,1850);
        tempStallionLocations.splice(0,1850);
        item = item + `<div class="reports-wrapper inner-wrapper" style="margin-top: 16px;">
          <div class="content-wrapper">
              <div class="report-internal" style="margin-top: 0px; padding-top: 20px;">
                  <h5>${slice.join('')}</h5>
              </div>
          </div>
          <div class="footer-wrapper">
              <img src="${pathReportTemplateStyles}/images/stallion-logo.png" alt="stallion match"/>
          </div>
        </div>`;
      
      }
      length = tempStallionLocations.length;
      slice = tempStallionLocations.slice(0,tempStallionLocations.length);
      tempStallionLocations.splice(0,tempStallionLocations.length);
      item = item + `<div class="reports-wrapper inner-wrapper" style="margin-top: 16px;">
          <div class="content-wrapper">
              <div class="report-internal" style="margin-top: 0px; padding-top: 20px;">
                  <h5>${slice.join('')}</h5>
              </div>`;

              if((1984 - length) > 0){
                item = await this.appendFarmsInclude(item,tempFarmLocations,pathReportTemplateStyles,length,true);
              }
    }

    let data = {
      stallionLocation: stalionLocations,
      farmsIncluded: farmsIncluded,
      item: item,
    };
    return data;
  }

  async appendFarmsInclude(item,tempFarmLocations,pathReportTemplateStyles,length = 0,isInclude){
    let slice;
    if(tempFarmLocations.length < (1850 - length)){
      slice = tempFarmLocations.slice(0,tempFarmLocations.length);
      tempFarmLocations.splice(0,tempFarmLocations.length);
      if(isInclude){

        item = item + `<div class="affinity-internal">
            <div>
              <h6>Farms Included:</h6>
              <h5>${slice.join('')}</h5>
            </div>
        </div>`;
      }else{
        item = item + `<div class="reports-wrapper inner-wrapper" style="margin-top: 16px;">
        <div class="content-wrapper">
          <div class="report-internal" style="margin-top: 0px; padding-top: 20px;">
          <h5>${slice.join('')}</h5>
          </div></div>`;
      }
    item = item +`</div>
<div class="footer-wrapper">
    <img src="${pathReportTemplateStyles}/images/stallion-logo.png" alt="stallion match"/>
</div>
</div>`;
    }else{
      if(isInclude){
        slice = tempFarmLocations.slice(0,(1675 - length));
        tempFarmLocations.splice(0,(1675 - length));
      item = item + `<div class="affinity-internal">
          <div>
            <h6>Farms Included:</h6>
            <h5>${slice.join('')}</h5>
          </div>
      </div>`
      }else{
        slice = tempFarmLocations.slice(0,1850);
        tempFarmLocations.splice(0,1850);
        item = item + `<div class="reports-wrapper inner-wrapper" style="margin-top: 16px;">
          <div class="content-wrapper">
            <div class="report-internal" style="margin-top: 0px; padding-top: 20px;">
            <h5>${slice.join('')}</h5>
            </div>`;
      }
    item = item + `</div>
<div class="footer-wrapper">
    <img src="${pathReportTemplateStyles}/images/stallion-logo.png" alt="stallion match"/>
</div>
</div>`;
      
      while(tempFarmLocations.length > 1850){
          item = item + `<div class="reports-wrapper inner-wrapper" style="margin-top: 16px;">
          <div class="content-wrapper">
            <div class="report-internal" style="margin-top: 0px; padding-top: 20px;">`
        slice = tempFarmLocations.slice(0,1850);
        tempFarmLocations.splice(0,1850);
        item = item + `<h5>${slice.join('')}</h5>
            </div>
          </div>
          <div class="footer-wrapper">
                <img src="${pathReportTemplateStyles}/images/stallion-logo.png" alt="stallion match"/>
          </div>
        </div>`;
      }
      slice = tempFarmLocations.slice(0,tempFarmLocations.length);
      tempFarmLocations.splice(0,tempFarmLocations.length);
      item = item + `<div class="reports-wrapper inner-wrapper" style="margin-top: 16px;">
        <div class="content-wrapper">
            <div class="report-internal" style="margin-top: 0px; padding-top: 20px;">
                <h5>${slice.join('')}</h5>
            </div>
          </div>
          <div class="footer-wrapper">
                <img src="${pathReportTemplateStyles}/images/stallion-logo.png" alt="stallion match"/>
          </div>
        </div>`;
    }
    return item;
  }
}
