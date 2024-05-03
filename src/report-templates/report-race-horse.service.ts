import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import * as path from 'path';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesService } from 'src/horses/horses.service';
import { StakesWinnerComparisionSort } from 'src/utils/constants/stallions';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { HtmlToPdfService } from './html-to-pdf.service';
import { ReportTemplatesCommonService } from './report-templates-common.service';
import { RaceHorseService } from 'src/race-horse/race-horse.service';

@Injectable()
export class ReportRaceHorseService {
  constructor(
    @InjectRepository(Horse)
    readonly horseRepository: Repository<Horse>,
    readonly htmlToPdfService: HtmlToPdfService,
    readonly horsesService: HorsesService,
    readonly commonUtilsService: CommonUtilsService,
    readonly fileUploadsService: FileUploadsService,
    readonly rtCommonService: ReportTemplatesCommonService,
    readonly raceHorseService: RaceHorseService,
    readonly configService: ConfigService,
  ) {}

  //Get Race Horse Pedigree Report
  async getRaceHorseSearchReport(horseId: string, data) {
    const raceHorse = await this.raceHorseService.isValidRaceHorse(
      horseId,
    );
    let pedigree = await this.horsesService.getHypoMatingData(
      raceHorse.sireId,
      raceHorse.damId,
      5,
    );
    let raceHorseProfileImageData =
      await this.horsesService.getHorseProfilePicByHorseId(
        raceHorse.id,
      );
    let rhPedigree = await this.horsesService.getHypoMatingSchema(
      await pedigree.filter(
        (res) => res.HypoMating == 'HypoSire' || res.HypoMating == 'HypoDam',
      ),
      5,
    );
    let horseTag = await this.horseRepository.manager.query(
      `EXEC proc_HorseInfoInPedigree @phorseId=@0`,
      [raceHorse.id],
    );

    let horseInfoTag = null;
    if (horseTag.length) {
      horseInfoTag = horseTag[0].FirstTag;
    }
    let rhRecord = [
      [
        {
          hypoMating: null,
          horseName: await this.commonUtilsService.toTitleCase(
            raceHorse.horseName,
          ),
          generation: 0,
          hp: null,
          colour: null,
          category: horseInfoTag,
          image: null,
          matchResult: null,
        },
      ],
    ];
    rhPedigree = rhRecord.concat(rhPedigree);
    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      raceHorse: raceHorse,
      raceHorseProfileImageData: raceHorseProfileImageData,
      raceHorsePedigree: rhPedigree,
      graphs: await this.rtCommonService.getAptitudeAgeAndDistanceProfiles(
        raceHorse.sireId,
        raceHorse.damId,
        raceHorse.id,
      ),
      stakeWinners: await this.rtCommonService.getStakesWinnerComparison(
        raceHorse.sireId,
        raceHorse.damId,
        1,
        15,
        StakesWinnerComparisionSort.SIMILARITYSCORE,
        raceHorse.id,
      ),
    };
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
        '/src/report-templates/hbs/race-horse-search.html',
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
      )}/${uuid()}/race-horse~${raceHorse.horseUuid}~stallion-search-report.pdf`,
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

  //Overlap SW With Race Horse
  async getRaceHorsePedigreeOverlap(
    horseId: string,
    overlapId: string,
    data,
  ) {
    const raceHorse = await this.raceHorseService.isValidRaceHorse(
      horseId,
    );
    const rhSireHorse = await this.horsesService.findHorsesById(raceHorse.sireId);
    const rhDamHorse = await this.horsesService.findHorsesById(raceHorse.damId);
    const stakeWinner = await this.horsesService.findHorsesByUuid(overlapId);
    let raceHorseProfileImageData =
      await this.horsesService.getHorseProfilePicByHorseId(
        raceHorse.id,
      );
    let swProfileImageData =
      await this.horsesService.getHorseProfilePicByHorseId(stakeWinner.id);
    let overlapData = await this.horsesService.getPedigreeOverlapDetails(
      raceHorse.sireId,
      raceHorse.damId,
      stakeWinner.id,
      5,
    );
    let rhPedigree = await this.horsesService.getHypoMatingSchema(
      await overlapData.filter(
        (res) => res.HypoMating == 'HypoSire' || res.HypoMating == 'HypoDam',
      ),
      5,
    );
    let swPedigree = await this.horsesService.getHypoMatingSchema(
      await overlapData.filter(
        (res) => res.HypoMating != 'HypoSire' && res.HypoMating != 'HypoDam',
      ),
      5,
    );
    let horseTag = await this.horseRepository.manager.query(
      `EXEC proc_HorseInfoInPedigree @phorseId=@0`,
      [raceHorse.id],
    );

    let horseInfoTag = null;
    if (horseTag.length) {
      horseInfoTag = horseTag[0].FirstTag;
    }
    let rhRecord = [
      [
        {
          hypoMating: null,
          horseName: await this.commonUtilsService.toTitleCase(
            raceHorse.horseName,
          ),
          generation: 0,
          hp: null,
          colour: null,
          category: horseInfoTag,
          image: null,
          matchResult: null,
        },
      ],
    ];
    rhPedigree = rhRecord.concat(rhPedigree);
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
    // if (typeof stallionPedigree[2] !== 'undefined') {
    //   await stallionPedigree[2].map(async (item) => {
    //     item.category = item.FirstInfo;
    //     return item;
    //   });
    // }
    // if (typeof marePedigree[2] !== 'undefined') {
    //   await marePedigree[2].map(async (item) => {
    //     item.category = item.FirstInfo;
    //     return item;
    //   });
    // }
    //return overlapData
    let stakes = await this.horsesService.getHorseStakeDetails(overlapId);
    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      raceHorse: rhPedigree,
      swPedigree: swPedigree,
      stakes: stakes,
      stakeWinnerHorseName: await this.commonUtilsService.toTitleCase(
        stakeWinner.horseName,
      ),
      raceHorseProfileImageData: raceHorseProfileImageData,
      swProfileImageData: swProfileImageData,
    };
    //return data
    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/race-horse-pedegree-overlap.html',
      ),
      'utf-8',
    );
    let s3ReportLocation = await this.htmlToPdfService.generatePDF(
      contents,
      `${this.configService.get(
        'file.s3DirPedigreeOverlap',
      )}/${uuid()}/${raceHorse.horseUuid}~${overlapId}~pedigree-overlap-report.pdf`,
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
}
