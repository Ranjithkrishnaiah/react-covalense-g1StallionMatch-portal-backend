import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import * as mime from 'mime-types';
import { getUnixTime } from 'date-fns';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { getRepository } from 'typeorm';
import { PRODUCTCOVERIMAGE } from 'src/utils/constants/products';

//@Injectable({ scope: Scope.REQUEST })
export class CommonUtilsService {
  constructor(
 //   @Inject(REQUEST) private readonly request: Request,
    private readonly configService: ConfigService,
  ) {}

  /* Get All Promotion Statuses */
  async getAllPromotionsStatus() {
    return [
      {
        id: 1,
        name: 'Promoted',
      },
      {
        id: 2,
        name: 'Non-Promoted',
      },
    ];
  }

  /* Get All Fee Statuses */
  async getAllFeeStatus() {
    return [
      {
        id: 1,
        name: 'Farm Update',
      },
      {
        id: 2,
        name: 'Internal Update',
      },
      {
        id: 3,
        name: 'External Update',
      },
    ];
  }

  /* Get File Path By File Key - AWS S3 */
  async getFilePathByFileKey(fileKey) {
    let fileLocation =
      'https://' +
      this.configService.get('file.awsDefaultS3Bucket') +
      '.s3.' +
      this.configService.get('file.awsS3Region') +
      '.amazonaws.com/' +
      fileKey;
    return fileLocation;
  }

  /* Get All Year List */
  async getYearsList(start, stop, step) {
    let data = Array.from(
      { length: (stop - start) / step + 1 },
      (_, i) => start + i * step,
    );
    return data;
  }

  /* Remove File From S3 Using fileKey */
  async removeFileFromS3(fileKey: string) {
    //Delete File from S3
    const s3 = new S3();
    await s3
      .deleteObject({
        Bucket: this.configService.get('file.awsDefaultS3Bucket'),
        Key: fileKey,
      })
      .promise();
  }

  /* Get MimeType By File Name */
  async getMimeTypeByFileName(fileName: string) {
    return mime.lookup(fileName);
  }

  /* Get FileName By FilePath */
  async getFileNameByFilePath(filePath: string) {
    let filePathArray = filePath.split('/');
    filePathArray.reverse();
    return filePathArray[0];
  }

  /* Get Current UTC DateTime */
  async getCurrentUTCDateTime() {
    return new Date();
  }

  /* Get UTC TimeStamp in Seconds */
  async getUTCTimestampInSeconds(date) {
    return getUnixTime(date).valueOf();
  }

  /* Get Tree Structure from Flat Data */
  async getTreeHierarchyFromFlatData(flatData) {
    await flatData.map(async (rec) => {
      rec.id = rec.id + '_' + rec.generation;
      if (rec.childId) {
        rec.childId = rec.childId + '_' + (rec.generation - 1);
      }
      return rec;
    });
    const createDataTree = (results) => {
      const hashTable = Object.create(null);
      results.forEach(
        (aData) => (hashTable[aData.id] = { ...aData, children: [] }),
      );
      const dataTree = [];
      results.forEach((aData) => {
        if (aData.childId) {
          const isExist = hashTable[aData.childId].children.some(
            (el) => el.id === aData.id,
          );
          if (!isExist)
            hashTable[aData.childId].children.push(hashTable[aData.id]);
        } else {
          dataTree.push(hashTable[aData.id]);
        }
      });
      return dataTree;
    };
    return createDataTree(flatData);
  }

  /* Get All Contact Us Interests */
  async getContactusInterests() {
    return [
      {
        id: 1,
        name: 'Promote My Stallion',
      },
      {
        id: 2,
        name: 'Promote My Farm',
      },
      {
        id: 3,
        name: 'Order Reports',
      },
      {
        id: 4,
        name: 'Missing Horse',
      },
      {
        id: 5,
        name: 'Other',
      },
    ];
  }

  /* String to PascalCase */
  async toPascalCase(String) {
    const words = String.match(/[a-z]+/gi);
    if (!words) {
      return '';
    }
    return words
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
      })
      .join(' ');
  }

  /* String to PascalCase - Second Word Onwards */
  toPascalCaseSecond(str) {
    if (!str) return str;
    return str
      .match(/\w\S*/g)
      .map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())
      .join(' ');
  }

  /* String to Title Case */
  async toTitleCase(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  /* Pagination For Procedure */
  async paginateForProc(items, page = 1, perPage = 20, totalRecCnt) {
    const totalPages = Math.ceil(totalRecCnt / perPage);
    return {
      data: items,
      meta: {
        page: page,
        limit: perPage,
        itemCount: totalRecCnt,
        pageCount: totalPages,
        hasPreviousPage: page - 1 ? true : false,
        hasNextPage: totalPages > page ? true : false,
      },
    };
  }

  /* Array to Chunks */
  async arrayToChunks(inputArr, noOfChunks) {
    let result = [];
    for (let i = 0; i < inputArr.length; i += noOfChunks) {
      result.push(inputArr.slice(i, i + noOfChunks));
    }
    return result;
  }

  /* Sort By Property */
  async sortByProperty(property) {
    return function (a, b) {
      if (a[property] > b[property]) return 1;
      else if (a[property] < b[property]) return -1;
      return 0;
    };
  }

  /* AncestorsList To Chunks to Chunks */
  async commonAncestorsListToChunks(inputArr, noOfChunks, noOfFirstChunks) {
    let result = [];
    let chunks = noOfFirstChunks;
    for (let i = 0; i < inputArr.length; i += chunks) {
      if (i === 0) {
        result.push(inputArr.slice(i, i + chunks));
      } else {
        chunks = noOfChunks;
        result.push(inputArr.slice(i, i + chunks));
      }
    }
    return result;
  }

  /* Set Midnight */
  async setToMidNight(date) {
    date = new Date(date);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  /* Set Hours Zero */
  async setHoursZero(date) {
    date = new Date(date);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  /*Add weeks to date */
  async addWeeksToDate(dateObj,numberOfWeeks) {
    await dateObj.setDate(dateObj.getDate()+ numberOfWeeks * 6);
    return dateObj;
  }

  /* Data Formate */
  async dateFormate(date) {
    if (!date) return '';
    var month = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    let dateArr = date.toLocaleDateString('en-us').split('/');
    return (
      dateArr[1] + ' ' + month[parseInt(dateArr[0]) - 1] + ', ' + dateArr[2]
    );
  }

  /* Add Commas - Pricing */
  async insertCommas(fee: any) {
    if (fee) {
      let tempFee = fee.toString();

      let nStr = tempFee + '';
      var x = nStr.split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
    }
    return fee;
  }

  /* Get CountryStates From Filter - Stallion/Farm Directory */
  async getCountryStatesFromFilter(inputData) {
    let countryStatesList = [];
    inputData.map((record: any) => {
      if (!countryStatesList[record.countryId]) {
        countryStatesList[record.countryId] = {
          countryId: record.countryId,
          label: record.countryName,
          countryCode: record.countryCode,
          countryA2Code: record.countryA2Code,
          children: [],
        };
      }
      if (record.stateId) {
        let state = {
          countryId: record.countryId,
          stateId: record.stateId,
          label: record.stateName,
          expanded: true,
        };
        let statesCheck = countryStatesList[record.countryId].children.filter(function (item) {
          return item.stateId === state.stateId;
        });
        if (!statesCheck.length)
        countryStatesList[record.countryId].children.push(state);
      }
    });
    
    countryStatesList.map(function name(record) {
      record.children.sort((a, b) => a.label.localeCompare(b.label));
      record.children.filter(function (item) {
        return item !== null;
      })
    })
    countryStatesList.sort((a, b) => a.label.localeCompare(b.label));
    let finalCountryStatesList = countryStatesList.filter(function (item) {
      return item != null;
    });
    return finalCountryStatesList
  }

  async getReportCoverImage(productCode){
    return PRODUCTCOVERIMAGE[productCode];
  }
}
