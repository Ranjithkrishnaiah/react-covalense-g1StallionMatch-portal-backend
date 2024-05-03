import {
  Inject,
  Injectable,
  Scope,
  UploadedFile,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { getCSVFile } from 'src/utils/file-uploading.utils';
import { MareListInfo } from 'src/mare-list-info/entities/mare-list-info.entity';
import { MareList } from 'src/mares-list/entities/mare-list.entity';
import { UpdateListInfoDto } from 'src/mare-list-info/dto/update-list-info.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { MareListRes } from './dto/mare-list-res-info.dto';
import { FarmsService } from 'src/farms/farms.service';
const csv = require('csv-parser');
var fs = require('fs');
import { ConfigService } from '@nestjs/config';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';

@Injectable({ scope: Scope.REQUEST })
export class MaresListService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MareList)
    private mareListRepository: Repository<MareList>,
    private readonly farmService: FarmsService,
    private readonly configService: ConfigService,
    private readonly fileUploadsService: FileUploadsService,
    private commonUtilsService: CommonUtilsService,
  ) {}

  /* Get all mare lists */
  async findAll(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<MareList[]>> {
    const member = this.request.user;
    let mlcntQuery = getRepository(MareListInfo)
      .createQueryBuilder('mli')
      .select('mli.id, count(marelist.id) maresCount')
      .innerJoin('mli.marelists', 'marelist')
      .groupBy('mli.id');

    const queryBuilder = getRepository(MareListInfo)
      .createQueryBuilder('mli')
      .select(
        'mli.maresListUuid as mareListInfoId, mli.listname as listname, mli.listFileName, mli.createdOn as uploadedOn, maresCount',
      )
      .innerJoin('(' + mlcntQuery.getQuery() + ')', 'mlcnt', 'mlcnt.id=mli.id')
      .innerJoin('mli.farm', 'farm', 'farm.isVerified=1 AND farm.isActive=1')
      .andWhere('farm.farmUuid = :farmId', { farmId: searchOptionsDto.farmId })
      .andWhere('mli.createdBy = :createdBy', { createdBy: member['id'] });

    if (searchOptionsDto.sortBy) {
      const sortBy = searchOptionsDto.sortBy;
      const byOrder = searchOptionsDto.order;
      if (sortBy.toLowerCase() === 'name') {
        queryBuilder.orderBy('mli.listname', 'ASC');
      } else if (sortBy.toLowerCase() === 'date') {
        queryBuilder.orderBy('mli.createdOn', 'DESC');
      } else if (sortBy.toLowerCase() === 'number of mares') {
        queryBuilder.orderBy('mlcnt.maresCount', 'DESC');
      } else {
        queryBuilder.orderBy('mli.createdOn', 'DESC');
      }
    } else {
      queryBuilder.orderBy('mli.createdOn', 'DESC');
    }
    queryBuilder.offset(searchOptionsDto.skip).limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  /* Get one mare list by Id and farmId */
  async findOne(id: string, farmId: string): Promise<MareListRes[]> {
    const member = this.request.user;

    const queryBuilder = getRepository(MareListInfo)
      .createQueryBuilder('mli')
      .select(
        'mli.maresListUuid as id, mli.listname as listname, mli.listFileName, mli.createdOn as uploadedOn, mli.listFilePath as listFilePath',
      )
      .innerJoin('mli.farm', 'farm', 'farm.isVerified=1 AND farm.isActive=1')
      .andWhere('farm.farmUuid = :farmId', { farmId: farmId })
      .andWhere('mli.maresListUuid = :id', { id: id })
      .andWhere('mli.createdBy = :createdBy', { createdBy: member['id'] });

    return await queryBuilder.getRawMany();
  }

  /* Update mare list name */
  async update(id: string, updateDto: UpdateListInfoDto) {
    const member = this.request.user;
    const record = this.findOne(id, updateDto.farmId);
    if (!record) {
      throw new NotFoundException();
    }

    const updateData = {
      listname: updateDto.listname,
      modifiedBy: member['id'],
    };
    let updated = await getRepository(MareListInfo).update(
      { maresListUuid: id, createdBy: member['id'] },
      updateData,
    );
    if (!updated) {
      throw new NotFoundException();
    }
    return updated;
  }

  /* delete a mare list */
  async delete(id: string, farmId: string) {
    let record = await this.findOne(id, farmId);
    if (!record.length) {
      throw new NotFoundException();
    }

    let recordWithId = await getRepository(MareListInfo).findOne({
      maresListUuid: id,
    });
    const list = await MareList.delete({ marelistid: recordWithId['id'] });
    if (list) {
      await this.fileUploadsService.removeFileFromS3(record[0]['listFilePath']);

      return await getRepository(MareListInfo).delete({ maresListUuid: id });
    }
  }

  /* Upload a mare list file */
  async uploadFile(
    farmId: string,
    @UploadedFile() file: Express.Multer.File,
    user: any,
    listname: string,
  ) {
    const farm = await this.farmService.getFarmByUuid(farmId);
    const csvPath = getCSVFile();
    const filePath = csvPath + this.request.file.filename;

    const list = await getRepository(MareListInfo).save({
      createdBy: user.id,
      listname,
      listFileName: this.request.file.filename,
      farmId: farm['id'],
    });

    if (list) {
      const results = [];
      await fs
        .createReadStream(filePath)
        .pipe(csv())
        .on('data', async (data) => {
          let isValid = '';
          const keys = Object.keys(data);
          keys.forEach((key) => {
            if (!data[key] || data[key].length < 2) {
              isValid = key;
            }
          });
          if (isValid == '') results.push(data);
        })
        .on('end', async () => {
          const newArr = results.map((v) => ({
            ...v,
            marelistid: list.id,
            createdBy: user.id,
          }));
          newArr.forEach((element) => {
            MareList.save(element);
          });
          await this.uploadCsvFileToS3(farmId, list, file);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
        });
    }

    const response = {
      message: 'File uploaded successfully!',
      data: {
        originalname: file.originalname,
        filename: file.filename,
        uploading_date: new Date(),
      },
    };

    return response;
  }

  /* Get mare list with details */
  async findOneDetails(id: number) {
    const member = this.request.user;
    // const repo = getRepository(MareList);
    const queryBuilder = getRepository(MareList)
      .createQueryBuilder('ml')
      .select(
        'ml.id as mareListInfoId, ml.name as name, ml.country as country, ml.year as year, ml.sire as sire, ml.dam as dam, ml.damcountry as damcountry',
      )
      .addSelect('marelistinfo.id as marelistId')
      .innerJoin('ml.marelistinfo', 'marelistinfo')
      .innerJoin(
        'marelistinfo.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .andWhere('ml.createdBy = :createdBy', { createdBy: member['id'] })
      .andWhere('marelistinfo.id = :marelistid', { marelistid: id });

    const results = await queryBuilder.getRawMany();
    return results;
  }

  /* Upload marelist file to S3 */
  async uploadCsvFileToS3(farmId, mareList, file: any) {
    let fileMimeType = await this.commonUtilsService.getMimeTypeByFileName(
      file.filename,
    );
    await this.fileUploadsService.allowOnlyCsvFile(fileMimeType);
    const fileKey = `${this.configService.get(
      'file.s3DirMaresList',
    )}/${farmId}/${mareList.maresListUuid}/${file.filename}`;
    const csvPath = getCSVFile();

    await fs.readFile(
      csvPath + this.request.file.filename,
      async (err, data) => {
        if (err) throw err;
        const params = {
          Bucket: this.configService.get('file.awsDefaultS3Bucket'), // pass your bucket name
          Key: fileKey, // file will be saved as testBucket/contacts.csv
          Body: data,
          ContentType: fileMimeType,
        };
        await this.fileUploadsService.uploadCsvFileToS3Bucket(
          params,
          async (err, resData) => {
            if (err) {
              throw err;
            }
            const updateData = {
              listFilePath: fileKey,
            };
            let record = await getRepository(MareListInfo).update(
              { maresListUuid: mareList.maresListUuid },
              updateData,
            );
            if (!record) {
              throw new NotFoundException();
            }
          },
        );
      },
    );
  }

  /* Download mare list */
  async downloadMareList(id: string, farmId: string) {
    let record = await this.findOne(id, farmId);
    if (record.length == 0) {
      throw new NotFoundException();
    }
    const fileKey = record[0].listFilePath;
    return {
      downloadLinks: await this.fileUploadsService.generateGetPresignedUrl(
        fileKey,
      ),
    };
  }

  /* Get one mare list by id */
  async findMareById(maresListUuid) {
    const record = await this.mareListRepository.findOne({
      id: maresListUuid,
    });
    if (!record) {
      throw new UnprocessableEntityException('Mare not exist!');
    }
    return record;
  }
}
