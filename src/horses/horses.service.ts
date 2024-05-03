import {
  Injectable,
  UnprocessableEntityException,
  Scope,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { integer } from 'aws-sdk/clients/storagegateway';
import { Repository, getRepository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Horse } from './entities/horse.entity';
import { FavouriteFarm } from 'src/favourite-farms/entities/favourite-farm.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { HorseSearchDto } from './dto/horse-search.dto';
import { HorseCountsDto } from './dto/horse-counts.dto';
import { ConfigService } from '@nestjs/config';
import { CountryService } from 'src/country/service/country.service';
import { HorseProfileImage } from 'src/horse-profile-image/entities/horse-profile-image.entity';
import { FavouriteStallion } from 'src/favourite-stallions/entities/favourite-stallion.entity';

@Injectable({ scope: Scope.REQUEST })
export class HorsesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Horse)
    private horseRepository: Repository<Horse>,
    private commonUtilsService: CommonUtilsService,
    private readonly configService: ConfigService,
    private readonly countryService: CountryService,
  ) {}

  /* Get Horse By horseUuid */
  async findOne(id: string) {
    try {
      return await this.horseRepository.findOneOrFail({
        horseUuid: id,
      });
    } catch (err) {
      throw new UnprocessableEntityException('Horse not exist!');
    }
  }

  /* Get Female Horse By id */
  async findMareUuid(mareId) {
    const queryBuilder = this.horseRepository
      .createQueryBuilder()
      .select('horseUuid As h')
      .andWhere('h.id = :id', { id: mareId });
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /* Get Horse By id */
  async findOneById(id: number) {
    try {
      return await this.horseRepository.findOneOrFail({
        id: id,
      });
    } catch (err) {
      throw new UnprocessableEntityException('Horse not exist!');
    }
  }

  /* Get Female Horse By horseUuid and Sex */
  async findMareByUuid(id: string) {
    try {
      return await this.horseRepository.findOneOrFail({
        horseUuid: id,
        sex: 'F',
      });
    } catch (err) {
      throw new UnprocessableEntityException('Horse not exist!');
    }
  }

  /* Get Horse By horseUuid and Sex */
  async findHorseByIdAndGender(id: string, sex: string) {
    try {
      return await this.horseRepository.findOneOrFail({
        horseUuid: id,
        sex: sex,
      });
    } catch (err) {
      throw new UnprocessableEntityException('Horse not exist!');
    }
  }

  /* Get Male Horses By countryId */
  async maleHorsesByCountryId(countryId: integer) {
    const queryBuilder = this.horseRepository
      .createQueryBuilder('horse')
      .select('horse.horseUuid as horseId, horse.horseName');
    queryBuilder.andWhere('horse.countryId = :countryId', {
      countryId: countryId,
    });
    queryBuilder
      .andWhere('horse.sex = :sex', { sex: 'M' })
      .orderBy('horse.horseName', 'ASC');

    const entities = await queryBuilder.getRawMany();

    return entities;
  }

  /* Get Horse By id */
  async findHorseById(id: integer) {
    try {
      return await this.horseRepository.findOneOrFail({
        id: id,
      });
    } catch (err) {
      throw new UnprocessableEntityException('Horse not exist!');
    }
  }

  /* Get Horse By horseUuid */
  async findHorsesByUuid(horseUuid: string) {
    try {
      const record = await this.horseRepository.findOneOrFail({
        horseUuid,
      });
      if (!record) {
        throw new UnprocessableEntityException('Horse not exist!');
      } else {
        return record;
      }
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  /* Get Horse By id */
  async findHorsesById(horseId: number) {
    try {
      const record = await this.horseRepository.findOneOrFail({
        id: horseId,
      });
      if (!record) {
        throw new UnprocessableEntityException('Horse not exist!');
      } else {
        return record;
      }
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  /* Get Horse Pedigree By horseUuid and Sex */
  async getPedigree(horseUuid: string, sex: string, viewType: string) {
    try {
      const record = await this.horseRepository.findOneOrFail({
        horseUuid,
        sex,
      });
      if (!record) {
        throw new UnprocessableEntityException('Horse not exist!');
      }
      let horseCountryCode = null;
      const horseCountry = await this.countryService.findByCountryId(
        record.countryId,
      );
      if (horseCountry) {
        horseCountryCode = horseCountry.countryCode;
      }
      let results = await this.horseRepository.manager.query(
        `EXEC proc_SMPPerfectMatch @SireID=@0, @DamID=@1, @level=@2`,
        [record.sireId, record.damId, 5],
      );
      await results.map(function getItem(item) {
        if (item.generation === 1 && item.childId == null) {
          item.childId = record.id;
          item.progenyId = record.horseUuid;
          delete item.MatchResult;
          delete item.HypoMating;
          delete item.HypoMating;
        }
        return item;
      });

      let horseTag = await this.horseRepository.manager.query(
        `EXEC proc_HorseInfoInPedigree @phorseId=@0`,
        [record.id],
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
      let raceHorse = await this.horseRepository.manager.query(
        `EXEC procGetRaceHorseByHorseId @horseId=@0`,
        [record.horseUuid],
      );
      if (raceHorse.length) {
        raceHorseUrl = raceHorse[0].raceHorseUrl
        isRaceHorse = 1
      }

      let mainHorse = {
        ColorCoding: null,
        id: record.id,
        horseName: record.horseName,
        generation: 0,
        tag: record.sex === 'M' ? 'S' : 'D',
        hp: record.sex === 'M' ? 'S' : 'D',
        sireId: record.sireId,
        damId: record.damId,
        childId: null,
        sex: record.sex,
        yob: record.yob,
        horseId: record.horseUuid,
        countryId: record.countryId,
        colourId: record.colourId,
        gelding: record.gelding,
        isLocked: record.isLocked,
        isVerified: record.isVerified,
        horseTypeId: record.horseTypeId,
        cob: horseCountryCode,
        progenyId: null,
        FirstInfo: horseInfoTag,
        FirstInfoinFull: horseInfoInFullTag,
        isRaceHorse,
        raceHorseUrl,
      };

      let finalResults = [];
      finalResults.push(mainHorse);
      await results.map(function getItem(item) {
        finalResults.push(item);
      });
      if (viewType === 'tree') {
        return this.treePedigreeByHorseId(record, finalResults);
      } else {
        return finalResults;
      }
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  /* Get Horse Pedigree Tree By horseId */
  async treePedigreeByHorseId(record, results) {
    try {
      const horsePedigree = await this.getFlatPedigreeData(results);
      let horseProfileImageData = await this.getHorseProfilePicByHorseId(
        record.id,
      );
      let pedigreeTreeLevel = 0;
      if (Array.isArray(results)) {
        const resultCount = results.length;
        pedigreeTreeLevel = results[resultCount - 1].generation;
      }
      let horseRecord = {
        pedigreeTreeLevel: pedigreeTreeLevel,
        horseId: record.horseUuid,
        horseName: record.horseName,
        yob: record.yob,
        countryId: record.countryId,
        colourId: record.colourId,
        sex: record.sex,
        gelding: record.gelding,
        isLocked: record.isLocked,
        horseTypeId: record.horseTypeId,
        horseProfileImageData,
      };
      let resultData = {
        ...horseRecord,
        pedigree: horsePedigree.pedigree,
      };
      return resultData;
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  /* Get All Horse Counts */
  async allCounts() {
    const member = this.request.user;
    let memberMares = await this.horseRepository
      .createQueryBuilder('horse')
      .innerJoin('horse.membermares', 'membermares')
      .andWhere('horse.isVerified = :isVerified', { isVerified: 1 })
      .andWhere('horse.isActive = :isActive', { isActive: 1 })
      .andWhere('membermares.memberId=:memberId', { memberId: member['id'] })
      .getCount();

     let favouriteStallions =await getRepository(FavouriteStallion)
       .createQueryBuilder('favouritestallions')
      .innerJoin('favouritestallions.stallion', 'stallion')
      .andWhere('favouritestallions.createdBy=:memberId', {
         memberId: member['id'],
       })
       .andWhere('stallion.isVerified = :isVerified', { isVerified: 1 })
       .andWhere('stallion.isActive = :isActive', { isActive: 1 })
       .getCount();
    

    let favouriteDamsires = await this.horseRepository
      .createQueryBuilder('horse')
      .innerJoin('horse.favouritebroodmaresire', 'favouritebroodmaresire')
      .andWhere('horse.isVerified = :isVerified', { isVerified: 1 })
      .andWhere('favouritebroodmaresire.createdBy=:memberId', {
        memberId: member['id'],
      })
      .getCount();
    
    let favouriteFarms = await getRepository(FavouriteFarm)
      .createQueryBuilder('favouritefarms')
      .andWhere('favouritefarms.createdBy=:memberId', {
        memberId: member['id'],
      })
      .getCount();

    let response = new HorseCountsDto();
    response.favouriteDamsires = favouriteDamsires;
    response.favouriteFarms = favouriteFarms;
    response.favouriteStallions = favouriteStallions;
    response.memberMares = memberMares;
    
  
    return response;
  }

  /* Get All Horses By Filters */
  async findHorses(searchOptions: HorseSearchDto): Promise<Horse[]> {
    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireCountry.countryCode as sireCountryCode, sireHorse.yob as sireYob, sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.id as sireProgenyId',
      )
      .innerJoin('sireHorse.nationality', 'sireCountry')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damCountry.countryCode as damCountryCode, damHorse.yob as damYob, damHorse.horseName as damName, damHorse.horseUuid as damId, damHorse.id as damProgenyId',
      )
      .innerJoin('damHorse.nationality', 'damCountry')
      .andWhere('damHorse.horseName IS NOT NULL');

    const queryBuilder = this.horseRepository
      .createQueryBuilder('horse')
      .select(
        'horse.horseUuid as horseId, horse.horseName, country.countryCode, horse.yob',
      )
      .addSelect(
        'sire.sireId, sire.sireName, sire.sireYob, sire.sireCountryCode',
      )
      .addSelect('dam.damId, dam.damName, dam.damYob, dam.damCountryCode')
      .innerJoin('horse.nationality', 'country')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.damId',
      );

    if (searchOptions.horseName) {
      queryBuilder.andWhere('horse.horseName like :horseName', {
        horseName: `${searchOptions.horseName}%`,
      });
    }
    if (searchOptions.sex) {
      queryBuilder.andWhere('horse.sex = :sex', { sex: searchOptions.sex });
    }

    queryBuilder
      .andWhere('horse.gelding = :gelding', { gelding: false })
      .andWhere('horse.isActive = :isActive', { isActive: 1 })
      .andWhere('horse.isVerified = :isVerified', { isVerified: 1 });
    if (searchOptions.horseName) {
      queryBuilder.addOrderBy('horse.horseName');
      queryBuilder.addOrderBy(`CASE WHEN ROW_NUMBER() OVER (PARTITION BY horse.horseName ORDER BY horse.yob DESC) > 1 THEN 1 ELSE 0 END`);
      queryBuilder.addOrderBy('horse.yob', 'DESC');
    } else {
      queryBuilder.addOrderBy('horse.horseName', 'ASC');
      queryBuilder.addOrderBy('horse.yob', 'DESC');
    }
    const entities = await queryBuilder.getRawMany();
    return entities;
  }

  /* Get Horse Stake Details By horseId */
  async getHorseStakeDetails(horseId: string) {
    const record = await this.findHorsesByUuid(horseId);

    return await this.horseRepository.manager.query(
      `EXEC procGetHorseStakeRaceFirstPositionList 
                     @horseId=@0`,
      [record.id],
    );
  }

  /* Get Horse Flat Pedigree Data */
  async getFlatPedigreeData(finalData) {
    if (finalData[0].generation === 1) {
      await finalData.map(function getItem(item) {
        item.generation = item.generation - 1;
        return item;
      });
    }
    let result = [];
    finalData.map((record: any) => {
      if (!result[record.generation]) {
        result[record.generation] = [];
      }
      result[record.generation].push(record);
    });
    return {
      pedigree: result,
    };
  }

  /* Get Hypomating Data by sireId, damId and generation */
  async getHypoMatingData(sireId, damId, generation: number) {
    const finalData = await this.horseRepository.manager.query(
      `EXEC proc_SMPPerfectMatch @SireID=@0, @DamID=@1, @level=@2`,
      [sireId, damId, generation],
    );
    return finalData;
  }

  /* Get Horse HypoMatingSchema */
  async getHypoMatingSchema(finalData, gen, isLastColChangeReq = true) {
    let result = [];
    await finalData.map(async (record: any) => {
      if (!result[record.generation - 1]) {
        result[record.generation - 1] = [];
      }
      if (record.generation) {
        let matchResult = null
        if ((record.MatchResult == '20/20 MATCH !' || record.MatchResult == '20/20 MATCH')) {
          matchResult = '2020M'
        } else if ((record.MatchResult == 'A PERFECT MATCH !' || record.MatchResult == 'PERFECT MATCH')) {
          matchResult = 'PM'
        }
        result[record.generation - 1].push({
          hypoMating: record.HypoMating,
          horseName: await this.commonUtilsService.toTitleCase(
            record.horseName,
          ),
          generation: record.generation,
          hp: record.hp,
          tag: record.tag,
          colour: record.ColorCoding,
          category: record.FirstInfo,
          image: null,
          matchResult: matchResult,
        });
      }
    });
    if (isLastColChangeReq) {
      let lastItem = gen - 1;
      const perGroup = Math.ceil(result[lastItem].length / 8);
      result[lastItem] = new Array(8)
        .fill('')
        .map((_, i) =>
          result[lastItem].slice(i * perGroup, (i + 1) * perGroup),
        );
    }
    return result;
  }

  /* Get Horse Pedigree Overlap Details */
  async getPedigreeOverlapDetails(
    stallionId: number,
    mareId: number,
    stakeWinnerId: number,
    generation: number,
  ) {
    const finalData = await this.horseRepository.manager.query(
      `EXEC proc_SMPColorMatchPedigreeHypoSW 
                     @phyposire=@0,
                     @phypodam=@1,
                     @StakeWinnerHorseID=@2,
                     @pgen=@3`,
      [stallionId, mareId, stakeWinnerId, generation],
    );
    return finalData;
  }

  /* Get Compatible Stallions By BroodmareSire */
  async getCompatibleStallions(broodmareSireId: string) {
    const horseRecord = await this.findHorsesByUuid(broodmareSireId);
    const finalData = await this.horseRepository.manager.query(
      `EXEC proc_SMPGetFavouriteCompatibleStallionsByBroodmaresire 
        @pBroodmaresireId=@0`,
      [horseRecord.id],
    );
    return finalData;
  }

  //Get All Ancester Horse Ids
  async getAllAncestorHorsesByHorseId(horseId: string) {
    let ancestorHorse = await this.findHorsesByUuid(horseId);
    const finalData = await this.horseRepository.manager.query(
      `EXEC proc_SMPIncludeExcludeKeyAncestor 
      @phorseId=@0`,
      [ancestorHorse.id],
    );
    return finalData;
  }

  /* Get Horse Details By HorseId And Sex */
  async findHorseDetailsByHorseIdAndSex(horseId: number, sex = null) {
    try {
      let sireQueryBuilder = getRepository(Horse)
        .createQueryBuilder('sireHorse')
        .select(
          'sireHorse.horseName as sireName, sireHorse.id as sirePedigreeId',
        );

      let damQueryBuilder = getRepository(Horse)
        .createQueryBuilder('damHorse')
        .select('damHorse.horseName as damName, damHorse.id as damPedigreeId');

      const queryBuilder = this.horseRepository
        .createQueryBuilder('horse')
        .select(
          'horse.id, horse.horseUuid as horseId, horse.horseName, horse.yob, sire.sireName, dam.damName',
        )
        .addSelect('sire.sirePedigreeId as sireId, dam.damPedigreeId as damId')
        .addSelect('country.countryCode as countryCode')
        .leftJoin(
          '(' + sireQueryBuilder.getQuery() + ')',
          'sire',
          'sirePedigreeId=horse.sireId',
        )
        .leftJoin(
          '(' + damQueryBuilder.getQuery() + ')',
          'dam',
          'damPedigreeId=horse.damId',
        )
        .leftJoin('horse.nationality', 'country');
      queryBuilder.andWhere('horse.id =:horseId', { horseId: horseId });
      if (sex) {
        queryBuilder.andWhere('horse.sex =:sex', { sex: sex });
      }

      let record = await queryBuilder.getRawOne();
      if (!record) {
        throw new UnprocessableEntityException('Horse not exist!');
      } else {
        return record;
      }
    } catch (err) {
      throw err;
    }
  }

  /* Get Mare HypoMating Details By mareId */
  async getMareHypoMatingDetails(mareId: string, generation: number) {
    const mareRecord = await this.findHorsesByUuid(mareId);
    const finalData = await this.horseRepository.manager.query(
      `EXEC proc_SMPPerfectMatch @SireID=@0, @DamID=@1, @level=@2`,
      [mareRecord.sireId, mareRecord.damId, generation],
    );
    await finalData.map(async function getItem(item,index) {
      
      item.category = '';
      if (item.generation === 1 && item.childId == null) {
        item.childId = mareRecord.id;
        item.progenyId = mareRecord.horseUuid;
      }
      item.category = item.FirstInfo;
      return item;
    });
    let horseTag = await this.horseRepository.manager.query(
      `EXEC proc_HorseInfoInPedigree @phorseId=@0`,
      [mareRecord.id],
    );

    let result = [];
    result[0] = [];
    result[0].push({
      horseName: await this.commonUtilsService.toTitleCase(
        mareRecord.horseName,
      ),
      generation: 0,
      hp: 'C',
      tag: 'D',
      colour: null,
      category: ((horseTag.length)? horseTag[0].FirstTag: null),
      image: `${this.configService.get(
        'file.pathReportTemplateStylesAdmin',
      )}/images/horse-image.png`,
    });
    await finalData.reduce(async (promise, record: any) => {
      await promise;
      if (!result[record.generation]) {
        result[record.generation] = [];
      }
      if (record.generation) {
        
        result[record.generation].push({
          horseName: await this.commonUtilsService.toTitleCase(
            record.horseName,
          ),
          generation: record.generation,
          hp: record.hp,
          tag: record.tag,
          colour: record.ColorCoding,
          category: record.category,
          image: null,
        });
      }
    }, Promise.resolve());
    const perGroup = Math.ceil(result[5].length / 8);
    result[5] = new Array(8)
      .fill('')
      .map((_, i) => result[5].slice(i * perGroup, (i + 1) * perGroup));
    return result;
  }

  /* Get Mare HypoMating Details By sire and damId */
  async getHypoMatingDetails(sireId, damId, generation: number) {
    const finalData = await this.horseRepository.manager.query(
      `EXEC proc_SMPPerfectMatch @SireID=@0, @DamID=@1, @level=@2`,
      [sireId, damId, generation],
    );
    await finalData.map(function getItem(item) {
      item.category = '';
      if (item.generation <= 2) {
        item.category = item.FirstInfo;
      }
      return item;
    });
    let result = [];
    await finalData.reduce(async (promise,record: any) => {
      await promise;
      if (!result[record.generation - 1]) {
        result[record.generation - 1] = [];
      }
      if (record.generation) {
        let matchResult = null
        if ((record.MatchResult == '20/20 MATCH !' || record.MatchResult == '20/20 MATCH')) {
          matchResult = '2020M'
        } else if ((record.MatchResult == 'A PERFECT MATCH !' || record.MatchResult == 'PERFECT MATCH')) {
          matchResult = 'PM'
        }
        result[record.generation - 1].push({
          horseName: await this.commonUtilsService.toTitleCase(
            record.horseName,
          ),
          generation: record.generation,
          hp: record.hp,
          tag: record.tag,
          colour: record.ColorCoding,
          category: record.category,
          image: null,
          matchResult: matchResult,
        });
      }
    }, Promise.resolve());
    const perGroup = Math.ceil(result[4].length / 8);
    result[4] = new Array(8)
      .fill('')
      .map((_, i) => result[4].slice(i * perGroup, (i + 1) * perGroup));
    return result;
  }

  /* Get Horse Details By horseId */
  async findHorseDetails(horseId): Promise<any> {
    let horseRecord = await this.findMareByUuid(horseId);

    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireCountry.countryCode as sireCountryCode, sireHorse.yob as sireYob, sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.id as sireProgenyId',
      )
      .innerJoin('sireHorse.nationality', 'sireCountry')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damCountry.countryCode as damCountryCode, damHorse.yob as damYob, damHorse.horseName as damName, damHorse.horseUuid as damId, damHorse.id as damProgenyId',
      )
      .innerJoin('damHorse.nationality', 'damCountry')
      .andWhere('damHorse.horseName IS NOT NULL');

    let hpiQueryBuilder = getRepository(HorseProfileImage)
      .createQueryBuilder('hpi')
      .select('hpi.horseId as mediaHorseId, media.mediaUrl as profileMediaUrl')
      .innerJoin(
        'hpi.media',
        'media',
        'media.id=hpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      );

    const queryBuilder = this.horseRepository
      .createQueryBuilder('horse')
      .select(
        'horse.horseUuid as horseId, horse.horseName,horse.sex as horseGender, country.countryCode, horse.yob',
      )
      .addSelect(
        'sire.sireId, sire.sireName, sire.sireYob, sire.sireCountryCode',
      )
      .addSelect('dam.damId, dam.damName, dam.damYob, dam.damCountryCode')
      .addSelect('profileMediaUrl as profilePic')
      .innerJoin('horse.nationality', 'country')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.damId',
      )
      .leftJoin(
        '(' + hpiQueryBuilder.getQuery() + ')',
        'horseprofileimage',
        'mediaHorseId=horse.id',
      )
      .andWhere('horse.id = :id', { id: horseRecord.id });
    const entities = await queryBuilder.getRawOne();
    return entities;
  }

  /* Get Horse Profile Image By horseId */
  async getHorseProfilePicByHorseId(horseId: number) {
    let hpiQueryBuilder = getRepository(HorseProfileImage)
      .createQueryBuilder('hpi')
      .select('hpi.horseId as mediaHorseId, media.mediaUrl as profileMediaUrl')
      .innerJoin(
        'hpi.media',
        'media',
        'media.id=hpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    const queryBuilder = this.horseRepository
      .createQueryBuilder('horse')
      .select('profileMediaUrl as profilePic')
      .leftJoin(
        '(' + hpiQueryBuilder.getQuery() + ')',
        'horseprofileimage',
        'mediaHorseId=horse.id',
      );
    queryBuilder.andWhere('horse.id = :horseId', { horseId: horseId });
    return await queryBuilder.getRawOne();
  }

  //Get a Horse Pedigree
  async getHorsePedigree(horseUuid: string) {
    try {
      const record = await this.horseRepository.findOneOrFail({
        horseUuid,
        isActive: true,
        isVerified: true,
      });
      if (!record) {
        throw new UnprocessableEntityException('Horse not exist!');
      }
      return await this.getPedigree(record.horseUuid, record.sex, 'tree');
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }
}
