import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { Repository, getRepository } from 'typeorm';
import { format } from 'date-fns';
import { InjectRepository } from '@nestjs/typeorm';
import { HtmlToPdfService } from './html-to-pdf.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesService } from 'src/horses/horses.service';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { ConfigService } from '@nestjs/config';
import { StallionsService } from 'src/stallions/stallions.service';
import { ReportTemplatesCommonService } from './report-templates-common.service';
import { FarmsService } from 'src/farms/farms.service';
import { ReportBroodmareAffinityService } from './report-broodmare-affinity.service';
import { CountryService } from 'src/country/service/country.service';
import { ReportSalesCatelogueService } from './report-sales-catelogue.service';
import { ReportStallionAffinityService } from './report-stallion-affinity.service';
import { OrderReportService } from 'src/order-report/order-report.service';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import handlebars from 'handlebars';
import * as cheerio from 'cheerio';
import { PRODUCTCODES } from 'src/utils/constants/products';

@Injectable()
export class ReportTemplatesService {
  constructor(
    @InjectRepository(Horse)
    readonly horseRepository: Repository<Horse>,
    readonly htmlToPdfService: HtmlToPdfService,
    readonly horsesService: HorsesService,
    readonly commonUtilsService: CommonUtilsService,
    readonly fileUploadsService: FileUploadsService,
    readonly stallionsService: StallionsService,
    readonly rtCommonService: ReportTemplatesCommonService,
    readonly farmService: FarmsService,
    readonly configService: ConfigService,
    readonly reportBroodmareAffinityService: ReportBroodmareAffinityService,
    readonly countryService: CountryService,
    readonly reportSalesCatelogueService: ReportSalesCatelogueService,
    readonly reportStallionAffinityService: ReportStallionAffinityService,
    readonly orderReportService: OrderReportService,
  ) {}

  async getStallionSearchReport(stallionId: string, mareId: string, data) {
    const stallionData = await this.stallionsService.getStallionByUuid(
      stallionId,
    );
    const mareData = await this.horsesService.findHorseByIdAndGender(
      mareId,
      'F',
    );
    let pedigree = await this.horsesService.getHypoMatingData(
      stallionData.horseId,
      mareData.id,
      6,
    );
    let stallionFarmData = await this.farmService.getFarmLogoByFarmId(
      stallionData.farmId,
    );
    let stallionProfileImageData =
      await this.stallionsService.getStallionProfilePicsByStallionId(
        stallionData.id,
      );
    const stallionPedigree = await this.horsesService.getHypoMatingSchema(
      await pedigree.filter((res) => res.HypoMating == 'HypoSire'),
      6,
    );
    let mareProfileImageData =
      await this.horsesService.getHorseProfilePicByHorseId(mareData.id);
    const marePedigree = await this.horsesService.getHypoMatingSchema(
      await pedigree.filter((res) => res.HypoMating == 'HypoDam'),
      6,
    );
    /*const [
      pedigree, 
      graphs, 
      stakeWinners
    ] = await Promise.all([
      this.horsesService.getHypoMatingDetails(stallionData.horseId, mareData.id, 5), 
      this.rtCommonService.getAptitudeAgeAndDistanceProfiles(stallionData.horseId, mareData.id),
      this.rtCommonService.getStakesWinnerComparison(
        stallionData.horseId, 
        mareData.id,
        1,
        15
      )
    ]) */
    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      stallionFarmData: stallionFarmData,
      stallionProfileImageData: stallionProfileImageData,
      mareProfileImageData: mareProfileImageData,
      stallionPedigree: stallionPedigree,
      marePedigree: marePedigree,
      graphs: await this.rtCommonService.getAptitudeAgeAndDistanceProfiles(
        stallionData.horseId,
        mareData.id,
      ),
      stakeWinners: await this.rtCommonService.getStakesWinnerComparison(
        stallionData.horseId,
        mareData.id,
        1,
        15,
      ),
      alternateMatingSuggestions:
        await this.rtCommonService.getAlternateMatingSuggestions(
          stallionData.id,
          mareData.id,
        ),
    };
    data.stallionMatch = stallionPedigree[0][0].matchResult
      ? stallionPedigree[0][0].matchResult
      : null;
    //return data
    let waitSelectors = [
      'READY_GRAPH_APTITUDE',
      'READY_GRAPH_AGE',
      'READY_GRAPH_DISTANCE',
    ];
    // if (data.stakeWinners.length) {
    //   waitSelectors = [
    //     'READY_GRAPH_APTITUDE',
    //     'READY_GRAPH_AGE',
    //     'READY_GRAPH_DISTANCE',
    //   ];
    // }
    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/stallion-search.html',
      ),
      'utf-8',
    );
    contents = contents.replace(
      `GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_XVALUES`,
      `GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_XVALUES = ` +
        JSON.stringify(data.graphs.aptitudeProfile.aptitudeXAxisLabels),
    );
    contents = contents.replace(
      `GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_YVALUES`,
      `GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_YVALUES = ` +
        JSON.stringify(data.graphs.aptitudeProfile.aptitudeYAxisLabels),
    );
    contents = contents.replace(
      `GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_DATASETS`,
      `GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_DATASETS = ` +
        JSON.stringify(data.graphs.aptitudeProfile.aptitudeDatasets),
    );

    contents = contents.replace(
      `GRAPH_RADAR_STALLIONSEARCH_AGE_XVALUES`,
      `GRAPH_RADAR_STALLIONSEARCH_AGE_XVALUES = ` +
        JSON.stringify(data.graphs.ageProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_RADAR_STALLIONSEARCH_AGE_DATASETS`,
      `GRAPH_RADAR_STALLIONSEARCH_AGE_DATASETS = ` +
        JSON.stringify(data.graphs.ageProfile.datasets),
    );

    contents = contents.replace(
      `GRAPH_RADAR_STALLIONSEARCH_DISTANCE_XVALUES`,
      `GRAPH_RADAR_STALLIONSEARCH_DISTANCE_XVALUES = ` +
        JSON.stringify(data.graphs.distanceProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_RADAR_STALLIONSEARCH_DISTANCE_DATASETS`,
      `GRAPH_RADAR_STALLIONSEARCH_DISTANCE_DATASETS = ` +
        JSON.stringify(data.graphs.distanceProfile.datasets),
    );
    contents = contents.replace(
      `GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_DEFAULT_IMAGE`,
      `GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_DEFAULT_IMAGE = "${data.pathReportTemplateStyles}/images/default-aptitude-chart.png"`,
    );
    let s3ReportLocation = await this.htmlToPdfService.generatePDF(
      contents,
      `${this.configService.get(
        'file.s3DirStallionSearch',
      )}/${uuid()}/${stallionId}~${mareId}~stallion-search-report.pdf`,
      data,
      waitSelectors,
    );
    //return s3ReportLocation;
    return {
      downloadUrl: await this.fileUploadsService.generateGetPresignedUrl(
        s3ReportLocation,
      ),
    };
  }

  async getPedigreeOverlap(
    stallionId: string,
    mareId: string,
    overlapId: string,
    data,
  ) {
    //TODO OVERLAPPING
    const stallion = await this.stallionsService.getStallionByUuid(stallionId);
    const mare = await this.horsesService.findMareByUuid(mareId);
    const stakeWinner = await this.horsesService.findHorsesByUuid(overlapId);
    let stallionProfileImageData =
      await this.stallionsService.getStallionProfilePicsByStallionId(
        stallion.id,
      );
    let mareProfileImageData =
      await this.horsesService.getHorseProfilePicByHorseId(mare.id);
    let swProfileImageData =
      await this.horsesService.getHorseProfilePicByHorseId(stakeWinner.id);
    let stallionFarmData = await this.farmService.getFarmLogoByFarmId(
      stallion.farmId,
    );
    let overlapData = await this.horsesService.getPedigreeOverlapDetails(
      stallion.horseId,
      mare.id,
      stakeWinner.id,
      5,
    );
    const stallionPedigree = await this.horsesService.getHypoMatingSchema(
      await overlapData.filter((res) => res.HypoMating == 'HypoSire'),
      5,
      false,
    );
    const marePedigree = await this.horsesService.getHypoMatingSchema(
      await overlapData.filter((res) => res.HypoMating == 'HypoDam'),
      5,
      false,
    );
    let swPedigree = await this.horsesService.getHypoMatingSchema(
      await overlapData.filter(
        (res) => res.HypoMating != 'HypoSire' && res.HypoMating != 'HypoDam',
      ),
      5,
    );
    let swHorse = await overlapData.filter(
      (res) => res.HypoMating == 'SWHorse',
    );
    let firstSwRecord = [
      [
        {
          hypoMating: swHorse[0].HypoMating,
          horseName: await this.commonUtilsService.toTitleCase(
            swHorse[0].horseName,
          ),
          generation: 0,
          hp: swHorse[0].hp,
          colour: swHorse[0].ColorCoding,
          category: swHorse[0].FirstInfo,
          image: null,
          matchResult: null,
        },
      ],
    ];
    swPedigree = firstSwRecord.concat(swPedigree);
    if (typeof stallionPedigree[2] !== 'undefined') {
      await stallionPedigree[2].map(async (item) => {
        item.category = item.FirstInfo;
        return item;
      });
    }
    if (typeof marePedigree[2] !== 'undefined') {
      await marePedigree[2].map(async (item) => {
        item.category = item.FirstInfo;
        return item;
      });
    }
    //return overlapData
    let stakes = await this.horsesService.getHorseStakeDetails(overlapId);
    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      stallionPedigree: stallionPedigree,
      marePedigree: marePedigree,
      swPedigree: swPedigree,
      stakes: stakes,
      stakeWinnerHorseName: await this.commonUtilsService.toTitleCase(
        stakeWinner.horseName,
      ),
      stallionFarmData: stallionFarmData,
      stallionProfileImageData: stallionProfileImageData,
      mareProfileImageData: mareProfileImageData,
      swProfileImageData: swProfileImageData,
    };
    //return data
    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/pedegree-overlap.html',
      ),
      'utf-8',
    );
    let s3ReportLocation = await this.htmlToPdfService.generatePDF(
      contents,
      `${this.configService.get(
        'file.s3DirPedigreeOverlap',
      )}/${uuid()}/${stallionId}~${mareId}~${overlapId}~pedigree-overlap-report.pdf`,
      data,
      [],
    );
    //return s3ReportLocation
    return {
      downloadUrl: await this.fileUploadsService.generateGetPresignedUrl(
        s3ReportLocation,
      ),
    };
  }

  /********Admin Reports generated from here */
  async generateBroodMareSireReport(
    mareId,
    stallionIds,
    data,
    fullName,
    email,
  ) {
    //1D0E2FD0-E358-ED11-AAAA-068CCEF7CF68
    const horseData = await this.horsesService.findHorseDetailsByHorseIdAndSex(
      mareId,
      'F',
    );
    let sireLinesData = await this.rtCommonService.getTopPerformingSireLines(
      stallionIds,
    );
    data = {
      pathReportTemplateStylesAdmin: this.configService.get(
        'file.pathReportTemplateStylesAdmin',
      ),
      mareName: await this.commonUtilsService.toTitleCase(horseData.horseName),
      cob: horseData.countryCode,
      yob: horseData.yob,
      sireName: await this.commonUtilsService.toTitleCase(horseData.sireName),
      damName: await this.commonUtilsService.toTitleCase(horseData.damName),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      pedigree: await this.horsesService.getMareHypoMatingDetails(
        horseData.horseId,
        5,
      ),
      topperformingsirelines: await this.commonUtilsService.arrayToChunks(
        sireLinesData,
        28,
      ),
      graphs: await this.rtCommonService.getAptitudeAgeAndDistanceProfiles(
        horseData.sireId,
        horseData.damId,
      ),
      ...(await this.rtCommonService.getStallionFarmAndLocationsByStallionIds(
        stallionIds,
      )),
    };
    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/broodmaresire-report.html',
      ),
      'utf-8',
    );
    contents = contents.replace(
      `GRAPH_RADAR_BROODMARESIRE_AGE_XVALUES`,
      `GRAPH_RADAR_BROODMARESIRE_AGE_XVALUES = ` +
        JSON.stringify(data.graphs.ageProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_RADAR_BROODMARESIRE_AGE_DATASETS`,
      `GRAPH_RADAR_BROODMARESIRE_AGE_DATASETS = ` +
        JSON.stringify(data.graphs.ageProfile.datasets),
    );

    contents = contents.replace(
      `GRAPH_RADAR_BROODMARESIRE_DISTANCE_XVALUES`,
      `GRAPH_RADAR_BROODMARESIRE_DISTANCE_XVALUES = ` +
        JSON.stringify(data.graphs.distanceProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_RADAR_BROODMARESIRE_DISTANCE_DATASETS`,
      `GRAPH_RADAR_BROODMARESIRE_DISTANCE_DATASETS = ` +
        JSON.stringify(data.graphs.distanceProfile.datasets),
    );
    let s3ReportLocation = await this.htmlToPdfService.generatePDFForReport(
      contents,
      `${this.configService.get(
        'file.s3DirReportBroodmareSirePdf',
      )}/${uuid()}/${data.mareName}-brood-mare-sire.pdf`,
      data,
      ['READY_GRAPH_AGE', 'READY_GRAPH_DISTANCE'],
    );
    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async generateStallionMatchShortlistReport(
    mareId,
    stallionIds,
    data,
    fullName,
    email,
  ) {
    const horseData = await this.horsesService.findHorseDetailsByHorseIdAndSex(
      mareId,
      'F',
    );
    //  return await this.commonUtilsService.toTitleCase(horseData.horseName);
    let stallionAnalysisSummary =
      await this.rtCommonService.getShortListStallionsByStallionIds(
        mareId,
        stallionIds,
      );

    let strikeRateRanges =
      await this.rtCommonService.getSuccessProfileStrikeRateRanges();
    await stallionAnalysisSummary.reduce(async (promise, record) => {
      await promise;
      await record.successProfile.reduce(async (promiseInner, spItem) => {
        await promiseInner;
        let tempPercent = '';
        let percent = 0;
        if (spItem.column2.name && spItem.column2.name.includes('%')) {
          tempPercent = spItem.column2.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column2.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'S'),
            );
        }
        if (spItem.column3.name && spItem.column3.name.includes('%')) {
          tempPercent = spItem.column3.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column3.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SS'),
            );
        }
        if (spItem.column4.name && spItem.column4.name.includes('%')) {
          tempPercent = spItem.column4.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column4.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SSS'),
            );
        }
        if (spItem.column5.name && spItem.column5.name.includes('%')) {
          tempPercent = spItem.column5.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column5.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDS'),
            );
        }
        if (spItem.column6.name && spItem.column6.name.includes('%')) {
          tempPercent = spItem.column6.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column6.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDDD'),
            );
        }
      }, Promise.resolve());
      return record;
    }, Promise.resolve());
    //Sort By Rating
    stallionAnalysisSummary.sort(
      await this.commonUtilsService.sortByProperty('rating'),
    );
    //DESC Order
    stallionAnalysisSummary.reverse();
    let stallionAnalysisSummaryList =
      await this.rtCommonService.getShortlistSummaryList(
        stallionAnalysisSummary,
      );
    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStylesAdmin',
      ),
      mareName: await this.commonUtilsService.toTitleCase(horseData.horseName),
      cob: horseData.countryCode,
      yob: horseData.yob,
      sireName: await this.commonUtilsService.toTitleCase(horseData.sireName),
      damName: await this.commonUtilsService.toTitleCase(horseData.damName),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      pedigree: await this.horsesService.getMareHypoMatingDetails(
        horseData.horseId,
        5,
      ),
      graphs: await this.rtCommonService.getAptitudeAgeAndDistanceProfiles(
        horseData.sireId,
        horseData.damId,
      ),
      feeRange: await this.rtCommonService.getStallionsPriceRangeByStallionIds(
        'AUD',
        stallionIds,
      ),
      shortlistStallionAnalysisSummary: stallionAnalysisSummaryList,
      ...(await this.rtCommonService.getStallionFarmAndLocationsByStallionIds(
        stallionIds,
      )),
    };
    // return data;
    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/stallion-match-shortlist-report.html',
      ),
      'utf-8',
    );
    contents = contents.replace(
      `GRAPH_SHORTLIST_DAM_AGE_XVALUES`,
      `GRAPH_SHORTLIST_DAM_AGE_XVALUES = ` +
        JSON.stringify(data.graphs.ageProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_SHORTLIST_DAM_AGE_DATASETS`,
      `GRAPH_SHORTLIST_DAM_AGE_DATASETS = ` +
        JSON.stringify(data.graphs.ageProfile.datasets),
    );

    contents = contents.replace(
      `GRAPH_SHORTLIST_DAM_DISTANCE_XVALUES`,
      `GRAPH_SHORTLIST_DAM_DISTANCE_XVALUES = ` +
        JSON.stringify(data.graphs.distanceProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_SHORTLIST_DAM_DISTANCE_DATASETS`,
      `GRAPH_SHORTLIST_DAM_DISTANCE_DATASETS = ` +
        JSON.stringify(data.graphs.distanceProfile.datasets),
    );

    /* BOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */
    let scriptData = '';
    let selectorsList = [
      'READY_SHORTLIST_DAM_GRAPH_AGE',
      'READY_SHORTLIST_DAM_GRAPH_DISTANCE',
    ];
    await data.shortlistStallionAnalysisSummary.reduce(
      async (promise, parentitem) => {
        await promise;
        await parentitem.reduce(async (promiseInner, item) => {
          await promiseInner;
          let femaleData = item.graphs.ageProfile?.datasets[0]?.data;
          let maleData = item.graphs.ageProfile?.datasets[1]?.data;
          let highestAgeValue = 0
          if (femaleData.length > 0 && maleData.length > 0) {
            const finalArray = femaleData.concat(maleData);
            highestAgeValue = Math.max(...finalArray);
          }
          let ageStepSize = ((item.graphs.ageProfile?.datasets[0]?.data?.length > 0 && highestAgeValue > 5)? Math.round(highestAgeValue/5) : 1)

          femaleData = item.graphs.distanceProfile?.datasets[0]?.data;
          maleData = item.graphs.distanceProfile?.datasets[1]?.data;
          let highestDistValue = 0
          if (femaleData.length > 0 && maleData.length > 0) {
            const finalArray = femaleData.concat(maleData);
            highestDistValue = Math.max(...finalArray);
          }
          let distStepSize = ((item.graphs.distanceProfile?.datasets[0]?.data?.length > 0 && highestDistValue > 5)? Math.round(highestDistValue/5) : 1)

          let index = item.stallionId;
          scriptData =
            scriptData +
            `<script type="text/javascript">
      var ageChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_AGE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.ageProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.ageProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var image_${index} = ageChart_${index}.toBase64Image();
                  var ageChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_AGE_IMAGE_${index}')
                  ageChartImage_${index}.src = image_${index}
                  let ageChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_AGE_${index}");
                  ageChartElement_${index}.remove()
                  const ageElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(ageElements_${index}.length > 0){
                    ageElements_${index}[0].parentNode.removeChild(ageElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_AGE_${index}").style.visibility = "visible";
              },
          },
          scales: {
            r: {
              ticks: {
                beginAtZero: true,
                stepSize: ${ageStepSize}
              }
            }
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Age',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });
      var distanceChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.distanceProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.distanceProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var distanceImage_${index} = distanceChart_${index}.toBase64Image();
                  var distanceChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_IMAGE_${index}')
                  distanceChartImage_${index}.src = distanceImage_${index}
                  let distanceChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_DISTANCE_${index}");
                  distanceChartElement_${index}.remove()
                  const distanceElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(distanceElements_${index}.length > 0){
                    distanceElements_${index}[0].parentNode.removeChild(distanceElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_DISTANCE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          scales: {
            r: {
              ticks: {
                beginAtZero: true,
                stepSize: ${distStepSize}
              }
            }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Distance',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });
    </script>`;
          selectorsList.push(`READY_STALLION_GRAPH_AGE_${index}`);
          selectorsList.push(`READY_STALLION_GRAPH_DISTANCE_${index}`);
        }, Promise.resolve());
      },
      Promise.resolve(),
    );
    //return scriptData
    scriptData = scriptData + '</body>';
    contents = contents.replace(`</body>`, scriptData);
    /* EOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */
    let s3ReportLocation = await this.htmlToPdfService.generatePDFForReport(
      contents,
      `${this.configService.get(
        'file.s3DirReportStallionShortlistPdf',
      )}/${uuid()}/${data.mareName}-shortlist.pdf`,
      data,
      selectorsList,
    );
    // return s3ReportLocation
    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async generateStallionMatchProReport(
    mareId,
    stallionIds,
    data,
    fullName,
    email,
  ) {
    const horseData = await this.horsesService.findHorseDetailsByHorseIdAndSex(
      mareId,
      'F',
    );
    let stallionAnalysisSummary =
      await this.rtCommonService.getShortListStallionsByStallionIds(
        horseData.id,
        stallionIds,
      );
    let strikeRateRanges =
      await this.rtCommonService.getSuccessProfileStrikeRateRanges();
    await stallionAnalysisSummary.reduce(async (promise, record) => {
      await promise;
      await record.successProfile.reduce(async (promiseInner, spItem) => {
        await promiseInner;
        let tempPercent = '';
        let percent = 0;
        if (spItem.column2.name.includes('%')) {
          tempPercent = spItem.column2.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column2.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'S'),
            );
        }
        if (spItem.column3.name.includes('%')) {
          tempPercent = spItem.column3.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column3.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SS'),
            );
        }
        if (spItem.column4.name.includes('%')) {
          tempPercent = spItem.column4.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column4.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SSS'),
            );
        }
        if (spItem.column5.name.includes('%')) {
          tempPercent = spItem.column5.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column5.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDS'),
            );
        }
        if (spItem.column6.name.includes('%')) {
          tempPercent = spItem.column6.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column6.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDDD'),
            );
        }
      }, Promise.resolve());
      return record;
    }, Promise.resolve());
    //Sort By Rating
    stallionAnalysisSummary.sort(
      await this.commonUtilsService.sortByProperty('rating'),
    );
    //DESC Order
    stallionAnalysisSummary.reverse();
    let stallionAnalysisSummaryList =
      await this.rtCommonService.getShortlistSummaryList(
        stallionAnalysisSummary,
      );
    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStylesAdmin',
      ),
      mareName: await this.commonUtilsService.toTitleCase(horseData.horseName),
      cob: horseData.countryCode,
      yob: horseData.yob,
      sireName: await this.commonUtilsService.toTitleCase(horseData.sireName),
      damName: await this.commonUtilsService.toTitleCase(horseData.damName),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      pedigree: await this.horsesService.getMareHypoMatingDetails(
        horseData.horseId,
        5,
      ),
      graphs: await this.rtCommonService.getAptitudeAgeAndDistanceProfiles(
        horseData.sireId,
        horseData.damId,
      ),
      feeRange: await this.rtCommonService.getStallionsPriceRangeByStallionIds(
        'AUD',
        stallionIds,
      ),
      proStallionAnalysisSummary: stallionAnalysisSummaryList,
      ...(await this.rtCommonService.getStallionFarmAndLocationsByStallionIds(
        stallionIds,
      )),
    };
    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/stallion-match-pro-report.html',
      ),
      'utf-8',
    );
    contents = contents.replace(
      `GRAPH_PRO_DAM_AGE_XVALUES`,
      `GRAPH_PRO_DAM_AGE_XVALUES = ` +
        JSON.stringify(data.graphs.ageProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_PRO_DAM_AGE_DATASETS`,
      `GRAPH_PRO_DAM_AGE_DATASETS = ` +
        JSON.stringify(data.graphs.ageProfile.datasets),
    );

    contents = contents.replace(
      `GRAPH_PRO_DAM_DISTANCE_XVALUES`,
      `GRAPH_PRO_DAM_DISTANCE_XVALUES = ` +
        JSON.stringify(data.graphs.distanceProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_PRO_DAM_DISTANCE_DATASETS`,
      `GRAPH_PRO_DAM_DISTANCE_DATASETS = ` +
        JSON.stringify(data.graphs.distanceProfile.datasets),
    );

    /* BOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */
    let scriptData = '';
    let selectorsList = [
      'READY_PRO_DAM_GRAPH_AGE',
      'READY_PRO_DAM_GRAPH_DISTANCE',
    ];
    await data.proStallionAnalysisSummary.reduce(
      async (promise, parentitem) => {
        await promise;
        await parentitem.reduce(async (promiseInner, item) => {
          await promiseInner;
          let index = item.stallionId;
          scriptData =
            scriptData +
            `<script type="text/javascript">
      var ageChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_AGE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.ageProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.ageProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var image_${index} = ageChart_${index}.toBase64Image();
                  var ageChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_AGE_IMAGE_${index}')
                  ageChartImage_${index}.src = image_${index}
                  let ageChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_AGE_${index}");
                  ageChartElement_${index}.remove()
                  const ageElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(ageElements_${index}.length > 0){
                    ageElements_${index}[0].parentNode.removeChild(ageElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_AGE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Age',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });
      var distanceChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.distanceProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.distanceProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var distanceImage_${index} = distanceChart_${index}.toBase64Image();
                  var distanceChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_IMAGE_${index}')
                  distanceChartImage_${index}.src = distanceImage_${index}
                  let distanceChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_DISTANCE_${index}");
                  distanceChartElement_${index}.remove()
                  const distanceElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(distanceElements_${index}.length > 0){
                    distanceElements_${index}[0].parentNode.removeChild(distanceElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_DISTANCE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Distance',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });
    </script>`;
          selectorsList.push(`READY_STALLION_GRAPH_AGE_${index}`);
          selectorsList.push(`READY_STALLION_GRAPH_DISTANCE_${index}`);
        }, Promise.resolve());
      },
      Promise.resolve(),
    );
    //return scriptData
    scriptData = scriptData + '</body>';
    contents = contents.replace(`</body>`, scriptData);
    /* EOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */

    let s3ReportLocation = await this.htmlToPdfService.generatePDFForReport(
      contents,
      `${this.configService.get('file.s3DirReportSMProPdf')}/${uuid()}/${
        data.mareName
      }-pro.pdf`,
      data,
      selectorsList,
    );
    //return s3ReportLocation
    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async generateBroodmareAffinityReport(
    mareId,
    countryId,
    data,
    fullName,
    email,
  ) {
    const horseData = await this.horsesService.findHorseDetailsByHorseIdAndSex(
      mareId,
      'F',
    );
    const pedigree = await this.horsesService.getMareHypoMatingDetails(
      horseData.horseId,
      5,
    );
    const sPositionStrikeRateRanges =
      await this.reportBroodmareAffinityService.getBroodmareAffinityStrikeRateRanges(
        'S',
      );
    const { commonAncestorsList, commonAncestorsTabelTitles } =
      await this.reportBroodmareAffinityService.getAncestorsAffinityWithBroodMareSummaryList(
        horseData.id,
        countryId,
        sPositionStrikeRateRanges,
      );
    const stakeWinnersComparisonList =
      await this.reportBroodmareAffinityService.getBroodmareAffinityStakeWinnersComparisonList(
        horseData.id,
        countryId,
      );
    const topperformingsirelines =
      await this.reportBroodmareAffinityService.getBroodmareAffinityTopperformingsirelines(
        horseData.id,
        countryId,
        sPositionStrikeRateRanges,
      );
    const country = await this.countryService.getCountryById(countryId);
    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStylesAdmin',
      ),
      mareName: await this.commonUtilsService.toTitleCase(horseData.horseName),
      cob: horseData.countryCode,
      yob: horseData.yob,
      sireName: await this.commonUtilsService.toTitleCase(horseData.sireName),
      damName: await this.commonUtilsService.toTitleCase(horseData.damName),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      preparedForEmail: email,
      locations: country.countryName,
      pedigree: pedigree,
      ancestorsAffinityHeader: commonAncestorsTabelTitles,
      commonAncestorsList:
        await this.commonUtilsService.commonAncestorsListToChunks(
          commonAncestorsList,
          33,
          14,
        ),
      stakeWinners: await this.commonUtilsService.arrayToChunks(
        stakeWinnersComparisonList,
        27,
      ),
      topperformingsirelines: await this.commonUtilsService.arrayToChunks(
        topperformingsirelines,
        27,
      ),
    };

    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/broodmare-affinity-report.html',
      ),
      'utf-8',
    );

    let s3ReportLocation = await this.htmlToPdfService.generatePDFForReport(
      contents,
      `${this.configService.get(
        'file.s3DirReportBroodmareAffinityPdf',
      )}/${uuid()}/${data.mareName}-broodmare-affinity.pdf`,
      data,
      [],
    );
    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async generateSalesCatelogueReport(
    orderProductId: number,
    fullName: string,
    email: string,
  ) {
    /* horseId:1200204,lotId:72769,saleId:167 or 24, lotId:3295 */
    //return this.rtCommonService.reportSalesCatelogueService.getImpactProfile(936565,11)
    const orderData =
      await this.reportSalesCatelogueService.findOrderInfoByOrderId(
        orderProductId, PRODUCTCODES.REPORT_STALLION_MATCH_SALES
      );
    //  return orderData;
    const saleData =
      await this.reportSalesCatelogueService.findSaleInfoBySaleId(
        orderData[0].sales,
      );
    let horseIds = [];
    horseIds = await Promise.all(
      orderData.map(async (element) => {
        return element.lotId;
      }),
    );
    if (horseIds.length > 2) {
      horseIds = horseIds.slice(0, 2);
    }
    let stallionAnalysisSummary =
      await this.rtCommonService.getSalesLotsByHorseIds(
        horseIds,
        saleData?.countryId,
        1,
        null
      );

    let strikeRateRanges =
      await this.rtCommonService.getSuccessProfileStrikeRateRanges();
    await stallionAnalysisSummary.reduce(async (promise, record) => {
      await promise;
      await record.successProfile.reduce(async (promiseInner, spItem) => {
        await promiseInner;
        let tempPercent = '';
        let percent = 0;
        if (spItem.column2.name.includes('%')) {
          tempPercent = spItem.column2.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column2.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'S'),
            );
        }
        if (spItem.column3.name.includes('%')) {
          tempPercent = spItem.column3.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column3.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SS'),
            );
        }
        if (spItem.column4.name.includes('%')) {
          tempPercent = spItem.column4.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column4.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SSS'),
            );
        }
        if (spItem.column5.name.includes('%')) {
          tempPercent = spItem.column5.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column5.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDS'),
            );
        }
        if (spItem.column6.name.includes('%')) {
          tempPercent = spItem.column6.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column6.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDDD'),
            );
        }
      }, Promise.resolve());

      await record.impactProfile.reduce(async (promiseInner, spItem) => {
        await promiseInner;
        let tempPercent = '';
        let percent = 0;
        if (spItem.column2.name && spItem.column2.name.includes('%')) {
          tempPercent = spItem.column2.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column2.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'S'),
            );
        }
        if (spItem.column3.name && spItem.column3.name.includes('%')) {
          tempPercent = spItem.column3.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column3.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SS'),
            );
        }
        if (spItem.column4.name && spItem.column4.name.includes('%')) {
          tempPercent = spItem.column4.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column4.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SSS'),
            );
        }
        if (spItem.column5.name && spItem.column5.name.includes('%')) {
          tempPercent = spItem.column5.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column5.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDS'),
            );
        }
        if (spItem.column6.name && spItem.column6.name.includes('%')) {
          tempPercent = spItem.column6.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column6.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDDD'),
            );
        }
      }, Promise.resolve());

      return record;
    }, Promise.resolve());
    //Sort By Rating
    stallionAnalysisSummary.sort(
      await this.commonUtilsService.sortByProperty('rating'),
    );
    //DESC Order
    stallionAnalysisSummary.reverse();
    let stallionAnalysisSummaryList =
      await this.rtCommonService.getShortlistSummaryList(
        stallionAnalysisSummary,
      );

    let data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStylesAdmin',
      ),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      companyName: saleData?.companyName,
      saleName: saleData?.saleName,
      totalLots: orderData[0]?.quantity,
      startDate: saleData?.startDate
        ? format(new Date(orderData[0].createdDate), 'dd/MM/yy')
        : 'N/A',
      salesAnalysisSummary: stallionAnalysisSummaryList,
      //  ...await this.rtCommonService.getStallionFarmAndLocationsByStallionIds("4,12")
    };
    // return data;

    let contents = readFileSync(
      path.join(process.cwd(), '/src/report-templates/hbs/sales-report.html'),
      'utf-8',
    );

    /* BOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */
    let scriptData = '';
    let selectorsList = [];
    await data.salesAnalysisSummary.reduce(async (promise, parentitem) => {
      await promise;
      await parentitem.reduce(async (promiseInner, item) => {
        await promiseInner;
        let index = item.horseId;
        scriptData =
          scriptData +
          `<script type="text/javascript">
      var ageChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_AGE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.ageProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.ageProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var image_${index} = ageChart_${index}.toBase64Image();
                  var ageChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_AGE_IMAGE_${index}')
                  ageChartImage_${index}.src = image_${index}
                  let ageChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_AGE_${index}");
                  ageChartElement_${index}.remove()
                  const ageElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(ageElements_${index}.length > 0){
                    ageElements_${index}[0].parentNode.removeChild(ageElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_AGE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Age',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });
      var distanceChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.distanceProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.distanceProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var distanceImage_${index} = distanceChart_${index}.toBase64Image();
                  var distanceChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_IMAGE_${index}')
                  distanceChartImage_${index}.src = distanceImage_${index}
                  let distanceChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_DISTANCE_${index}");
                  distanceChartElement_${index}.remove()
                  const distanceElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(distanceElements_${index}.length > 0){
                    distanceElements_${index}[0].parentNode.removeChild(distanceElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_DISTANCE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Distance',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });

      
        
       var aptitudeChart_${index} = new Chart(document.getElementById('GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_${index}').getContext('2d'), {
          type: "bubble",
          data: {
            datasets: ${JSON.stringify(
              item.graphs.aptitudeProfile['aptitudeDatasets'],
            )}
          },
          options: {
            backgroundColor: "#f00",
            plugins: {
                legend: {
                    display: false
                },
            },
            scales: {
                y: {
                    type: 'category',
                    labels: ${JSON.stringify(
                      item.graphs.aptitudeProfile['aptitudeYAxisLabels'],
                    )},
                    grid: {
                        borderColor: "#B0B6AF",
                        //borderDashOffset: 2,
                    },  
                },
                x: {
                    type: 'category',
                    labels: ${JSON.stringify(
                      item.graphs.aptitudeProfile['aptitudeXAxisLabels'],
                    )},
                    grid: {
                        borderColor: "#B0B6AF",
                        //borderDashOffset: 2,
                    },
                },
            },
            animation: {
                onComplete: function () {
                    var aptitudeImage_${index} = aptitudeChart_${index}.toBase64Image();
                    var aptitudeChartImage_${index} = document.getElementById('GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_IMAGE_${index}')
                    aptitudeChartImage_${index}.src = aptitudeImage_${index}
                    let aptitudeChartElement_${index} = document.getElementById("GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_${index}");
                    if (aptitudeChartElement_${index}){
                        aptitudeChartElement_${index}.remove()
                    }
                    const elements = document.getElementsByClassName("chartjs-size-monitor");
                    while(elements.length > 0){
                        elements[0].parentNode.removeChild(elements[0]);
                    }
                    document.getElementById('READY_SALES_GRAPH_APTITUDE_${index}').style.visibility = 'visible';
                },
            },
          }
        }); 

    </script>`;
        selectorsList.push(`READY_STALLION_GRAPH_AGE_${index}`);
        selectorsList.push(`READY_STALLION_GRAPH_DISTANCE_${index}`);
        selectorsList.push(`READY_SALES_GRAPH_APTITUDE_${index}`);
      }, Promise.resolve());
    }, Promise.resolve());
    //return scriptData
    scriptData = scriptData + '</body>';
    contents = contents.replace(`</body>`, scriptData);
    /* EOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */

    let s3ReportLocation = await this.htmlToPdfService.generatePDFForReport(
      contents,
      `${this.configService.get(
        'file.s3DirReportSalesCateloguePdf',
      )}/${uuid()}/${saleData?.saleName}-sales-catelogue.pdf`,
      data,
      selectorsList,
    );
    //return s3ReportLocation
    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async generateStallionAffinityReport(stallionId, data, fullName, email) {
    const stallionData = await this.reportStallionAffinityService.getStallion(
      stallionId,
    );

    const horseData = await this.horsesService.findHorseDetailsByHorseIdAndSex(
      stallionData.horseId,
      'M',
    );
    const pedigree = await this.horsesService.getMareHypoMatingDetails(
      horseData.horseId,
      5,
    );
    const sPositionStrikeRateRanges =
      await this.reportStallionAffinityService.getStallionAffinityStrikeRateRanges(
        'S',
      );
    const { commonAncestorsList, commonAncestorsTabelTitles } =
      await this.reportStallionAffinityService.getAncestorsAffinityWithSireSummaryList(
        stallionData.id,
        sPositionStrikeRateRanges,
      );
    const stakeWinnersComparisonList =
      await this.reportStallionAffinityService.getStallionAffinityStakeWinnersComparisonList(
        stallionData.id,
      );
    const topperformingBroodMareSires =
      await this.reportStallionAffinityService.getStallionAffinityTopperformingBroodMareSires(
        stallionData.id,
        sPositionStrikeRateRanges,
      );

    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStylesAdmin',
      ),
      horseName: await this.commonUtilsService.toTitleCase(
        horseData.horseName,
      ),
      cob: horseData.countryCode,
      yob: horseData.yob,
      sireName: await this.commonUtilsService.toTitleCase(horseData.sireName),
      damName: await this.commonUtilsService.toTitleCase(horseData.damName),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      preparedForEmail: email,
      pedigree: pedigree,
      ancestorsAffinityHeader: commonAncestorsTabelTitles,
      commonAncestorsList:
        await this.commonUtilsService.commonAncestorsListToChunks(
          commonAncestorsList,
          33,
          14,
        ),
      stakeWinners: await this.commonUtilsService.arrayToChunks(
        stakeWinnersComparisonList,
        27,
      ),
      topperformingBroodMareSires: await this.commonUtilsService.arrayToChunks(
        topperformingBroodMareSires,
        27,
      ),
    };

    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/stallion-affinity-report.html',
      ),
      'utf-8',
    );

    let s3ReportLocation = await this.htmlToPdfService.generatePDFForReport(
      contents,
      `${this.configService.get(
        'file.s3DirReportStallionAffinityPdf',
      )}/${uuid()}/${data.horseName}-stallion-affinity.pdf`,
      data,
      [],
    );
    // await this.saveAsHtmlFile(data);

    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async saveAsHtmlFile(context) {
    let htmlFilePath = `${this.configService.get('app.frontendDomain')}/`;
    let bucketFileLocation = `mail-preview/${uuidv4()}/${uuidv4()}`;
    // Load the template file
    const templateFile = await fs.readFile(
      `src/report-templates/hbs/stallion-affinity-report.html`,
      'utf8',
    );
    // Compile the Handlebars template
    const template = handlebars.compile(templateFile);
    // Render the template with the provided data
    const renderedHtml = template(context);
    // Load the HTML text into a cheerio instance
    const $ = cheerio.load(renderedHtml);
    // Find the first table element
    const firstTable = $('table').first();
    // Remove the first table element if it exists
    if (firstTable) {
      firstTable.remove();
    }
    // Get the modified HTML text
    const modifiedHtmlText = $.html();
    //Copying Html to file - transfer to S3
    await this.fileUploadsService.uploadFileToS3(
      `${bucketFileLocation}.html`,
      Buffer.from(modifiedHtmlText),
      'text/html',
    );

    console.log(
      '================================htmlFilePath + bucketFileLocation',
      htmlFilePath + bucketFileLocation,
    );
  }

  async getBroodmareAffinityStrikeRateRanges(position: string) {
    return await this.horseRepository.manager.query(
      `EXEC Proc_SMPGetMareStrikeRateRangeByPosition 
          @pPosition=@0`,
      [position],
    );
  }

  async test(){
    let stallionsLocation = 'New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, adfaf kjdk fkjdf , kjdkf ,a djkf hdkf, jhkdfk f, fjkdfh la, jdhgfjkas. New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York,New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, New York, Pennsylvania, New Jersey, Kentucky, New York, adfaf kjdk fkjdf , kjdkf ,a djkf hdkf, jhkdfk f, fjkdfh la, jdhgfjkas.'
    let farmAndLocations = 'FArmmmmmmmmm Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New Yorkvvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New Yorkvvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New Yorkvvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New Yorkvvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New Yorkvvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York vvvvvvv Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York, Pennsylvania, New Jersey, Kentucky, New York'
    
    let stalionLocations = '';
    let farmsIncluded = '';
    let tempStallionLocations = stallionsLocation.split('');
    let tempFarmLocations = farmAndLocations.split('');
    let item = '';
    let slice;
    let length = 0;
    let pathReportTemplateStyles= this.configService.get('file.pathReportTemplateStylesAdmin');
    if(tempStallionLocations.length < 950){
      slice = tempStallionLocations.slice(0,tempStallionLocations.length);
      stalionLocations = slice.join('');
      
      slice = tempFarmLocations.slice(0,(665 - tempStallionLocations.length));
      farmsIncluded = slice.join('');

      tempStallionLocations.splice(0,tempStallionLocations.length);
      tempFarmLocations.splice(0,(665 - tempStallionLocations.length));
      if(tempFarmLocations.length){
        item = await this.appendFarmsAndLocations(item,tempFarmLocations,pathReportTemplateStyles,length,false);
      }
    }else{
      slice = tempStallionLocations.slice(0,950);
      tempStallionLocations.splice(0,950);
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
                item = await this.appendFarmsAndLocations(item,tempFarmLocations,pathReportTemplateStyles,length,true);
 
              }
    }

    let data = {
      pathReportTemplateStyles: pathReportTemplateStyles,
      stallionLocation: stalionLocations,
      farmsIncluded: farmsIncluded,
      item: item,
    };

    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/test_location.html',
      ),
      'utf-8',
    );

    let s3ReportLocation = await this.htmlToPdfService.generatePDFForReport(
      contents,
      `${this.configService.get(
        'file.s3DirReportStallionAffinityPdf',
      )}/00test/${uuid()}/test_location.pdf`,
      data,
      [],
    );

    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async appendFarmsAndLocations(item,tempFarmLocations,pathReportTemplateStyles,length = 0,isInclude){
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

  async generateStallionXBreederStockSaleReport(
    orderProductId: number,
    fullName: string,
    email: string
  ) {
    const orderData =
      await this.reportSalesCatelogueService.findOrderInfoByOrderId(
        orderProductId, PRODUCTCODES.REPORT_STALLION_BREEDING_STOCK_SALE
      );
    //  return orderData;
    const saleData =
      await this.reportSalesCatelogueService.findSaleInfoBySaleId(
        orderData[0].sales,
      );
    let horseIds = [];
    horseIds = await Promise.all(
      orderData.map(async (element) => {
        return element.lotId;
      }),
    );
    if (horseIds.length > 2) {
      horseIds = horseIds.slice(0, 2);
    }
    let stallionAnalysisSummary =
      await this.rtCommonService.getSalesLotsByHorseIds(
        horseIds,
        saleData?.countryId,
        2,
        orderData[0].stallionId
      );

    let strikeRateRanges =
      await this.rtCommonService.getSuccessProfileStrikeRateRanges();
    await stallionAnalysisSummary.reduce(async (promise, record) => {
      await promise;
      await record.successProfile.reduce(async (promiseInner, spItem) => {
        await promiseInner;
        let tempPercent = '';
        let percent = 0;
        if (spItem.column2.name.includes('%')) {
          tempPercent = spItem.column2.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column2.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'S'),
            );
        }
        if (spItem.column3.name.includes('%')) {
          tempPercent = spItem.column3.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column3.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SS'),
            );
        }
        if (spItem.column4.name.includes('%')) {
          tempPercent = spItem.column4.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column4.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SSS'),
            );
        }
        if (spItem.column5.name.includes('%')) {
          tempPercent = spItem.column5.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column5.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDS'),
            );
        }
        if (spItem.column6.name.includes('%')) {
          tempPercent = spItem.column6.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column6.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDDD'),
            );
        }
      }, Promise.resolve());

      await record.impactProfile.reduce(async (promiseInner, spItem) => {
        await promiseInner;
        let tempPercent = '';
        let percent = 0;
        if (spItem.column2.name && spItem.column2.name.includes('%')) {
          tempPercent = spItem.column2.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column2.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'S'),
            );
        }
        if (spItem.column3.name && spItem.column3.name.includes('%')) {
          tempPercent = spItem.column3.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column3.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SS'),
            );
        }
        if (spItem.column4.name && spItem.column4.name.includes('%')) {
          tempPercent = spItem.column4.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column4.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SSS'),
            );
        }
        if (spItem.column5.name && spItem.column5.name.includes('%')) {
          tempPercent = spItem.column5.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column5.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDS'),
            );
        }
        if (spItem.column6.name && spItem.column6.name.includes('%')) {
          tempPercent = spItem.column6.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column6.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDDD'),
            );
        }
      }, Promise.resolve());

      return record;
    }, Promise.resolve());
    //Sort By Rating
    stallionAnalysisSummary.sort(
      await this.commonUtilsService.sortByProperty('rating'),
    );
    //DESC Order
    stallionAnalysisSummary.reverse();
    let stallionAnalysisSummaryList =
      await this.rtCommonService.getShortlistSummaryList(
        stallionAnalysisSummary,
      );

    let data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStylesAdmin',
      ),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      companyName: saleData?.companyName,
      saleName: saleData?.saleName,
      totalLots: orderData[0]?.quantity,
      startDate: saleData?.startDate
        ? format(new Date(orderData[0].createdDate), 'dd/MM/yy')
        : 'N/A',
      salesAnalysisSummary: stallionAnalysisSummaryList,
      //  ...await this.rtCommonService.getStallionFarmAndLocationsByStallionIds("4,12")
    };
    // return data;

    let contents = readFileSync(
      path.join(process.cwd(), '/src/report-templates/hbs/stallion-breeding-stocksale-report.html'),
      'utf-8',
    );

    /* BOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */
    let scriptData = '';
    let selectorsList = [];
    await data.salesAnalysisSummary.reduce(async (promise, parentitem) => {
      await promise;
      await parentitem.reduce(async (promiseInner, item) => {
        await promiseInner;
        let index = item.horseId;
        scriptData =
          scriptData +
          `<script type="text/javascript">
      var ageChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_AGE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.ageProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.ageProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var image_${index} = ageChart_${index}.toBase64Image();
                  var ageChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_AGE_IMAGE_${index}')
                  ageChartImage_${index}.src = image_${index}
                  let ageChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_AGE_${index}");
                  ageChartElement_${index}.remove()
                  const ageElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(ageElements_${index}.length > 0){
                    ageElements_${index}[0].parentNode.removeChild(ageElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_AGE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Age',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });
      var distanceChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.distanceProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.distanceProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var distanceImage_${index} = distanceChart_${index}.toBase64Image();
                  var distanceChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_IMAGE_${index}')
                  distanceChartImage_${index}.src = distanceImage_${index}
                  let distanceChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_DISTANCE_${index}");
                  distanceChartElement_${index}.remove()
                  const distanceElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(distanceElements_${index}.length > 0){
                    distanceElements_${index}[0].parentNode.removeChild(distanceElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_DISTANCE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Distance',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });

      
        
       var aptitudeChart_${index} = new Chart(document.getElementById('GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_${index}').getContext('2d'), {
          type: "bubble",
          data: {
            datasets: ${JSON.stringify(
              item.graphs.aptitudeProfile['aptitudeDatasets'],
            )}
          },
          options: {
            backgroundColor: "#f00",
            plugins: {
                legend: {
                    display: false
                },
            },
            scales: {
                y: {
                    type: 'category',
                    labels: ${JSON.stringify(
                      item.graphs.aptitudeProfile['aptitudeYAxisLabels'],
                    )},
                    grid: {
                        borderColor: "#B0B6AF",
                        //borderDashOffset: 2,
                    },  
                },
                x: {
                    type: 'category',
                    labels: ${JSON.stringify(
                      item.graphs.aptitudeProfile['aptitudeXAxisLabels'],
                    )},
                    grid: {
                        borderColor: "#B0B6AF",
                        //borderDashOffset: 2,
                    },
                },
            },
            animation: {
                onComplete: function () {
                    var aptitudeImage_${index} = aptitudeChart_${index}.toBase64Image();
                    var aptitudeChartImage_${index} = document.getElementById('GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_IMAGE_${index}')
                    aptitudeChartImage_${index}.src = aptitudeImage_${index}
                    let aptitudeChartElement_${index} = document.getElementById("GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_${index}");
                    if (aptitudeChartElement_${index}){
                        aptitudeChartElement_${index}.remove()
                    }
                    const elements = document.getElementsByClassName("chartjs-size-monitor");
                    while(elements.length > 0){
                        elements[0].parentNode.removeChild(elements[0]);
                    }
                    document.getElementById('READY_SALES_GRAPH_APTITUDE_${index}').style.visibility = 'visible';
                },
            },
          }
        }); 

    </script>`;
        selectorsList.push(`READY_STALLION_GRAPH_AGE_${index}`);
        selectorsList.push(`READY_STALLION_GRAPH_DISTANCE_${index}`);
        //selectorsList.push(`READY_SALES_GRAPH_APTITUDE_${index}`);
      }, Promise.resolve());
    }, Promise.resolve());
    //return scriptData
    scriptData = scriptData + '</body>';
    contents = contents.replace(`</body>`, scriptData);
    /* EOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */

    let s3ReportLocation = await this.htmlToPdfService.generatePDFForReport(
      contents,
      `${this.configService.get(
        'file.s3DirReportStallionBreedingStockSalePdf',
      )}/${uuid()}/${saleData?.saleName}-stock-sale.pdf`,
      data,
      selectorsList,
    );
    //return s3ReportLocation
    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }


}
