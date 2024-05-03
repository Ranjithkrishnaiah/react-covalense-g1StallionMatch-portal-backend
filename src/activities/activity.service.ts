import { Inject, Injectable, Scope } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { BreederActivitySearchOptionsDto } from './dto/breeder-activity-search-options.dto';
import { Horse } from 'src/horses/entities/horse.entity';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';

@Injectable({ scope: Scope.REQUEST })
export class ActivitiesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly commonUtilsService: CommonUtilsService,
  ) {}

  /* Get Breeder Activity */
  async findBreederActivity(searchOptionsDto: BreederActivitySearchOptionsDto) {
    let fromDate = new Date();
    let toDate = new Date();
    // toDate.setHours(23, 59, 59, 999);
    const curr = new Date();
    if (searchOptionsDto.filterBy) {
      const filterBy = searchOptionsDto.filterBy;
      if (filterBy.toLowerCase() === 'this month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth(), 1);
        toDate = new Date(curr.getFullYear(), curr.getMonth() + 1, 0);
      }
      if (filterBy.toLowerCase() === 'this week') {
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        var last = first + 6; // last day is the first day + 6
        fromDate = new Date(curr.setDate(first));
        toDate = new Date(curr.setDate(last));
      }
      if (filterBy.toLowerCase() === 'this year') {
        fromDate = new Date(curr.getFullYear(), 0, 1);
        toDate = new Date(curr.getFullYear(), 11, 31);
      }
      if (filterBy.toLowerCase() === 'last month') {
        fromDate = new Date(curr.getFullYear(), curr.getMonth() - 1, 1);
        toDate = new Date(curr.getFullYear(), curr.getMonth(), 0);
      }
      if (filterBy.toLowerCase() === 'last year') {
        let lastYear = curr.getFullYear() - 1;
        fromDate = new Date(lastYear, 0, 1);
        toDate = new Date(lastYear, 11, 31);
      }
      if (filterBy.toLowerCase() === 'custom') {
        if (searchOptionsDto.fromDate && searchOptionsDto.toDate) {
          fromDate = new Date(searchOptionsDto.fromDate);
          toDate = new Date(searchOptionsDto.toDate);
        }
      }
    }
    fromDate = await this.commonUtilsService.setHoursZero(fromDate);
    toDate = await this.commonUtilsService.setToMidNight(toDate);
    let entities = await getRepository(Horse).manager.query(
      `EXEC Proc_SMPGetFarmBreederActivities 
          @farmId=@0,
          @fromDate=@1,
          @toDate=@2,
          @page=@3,
          @pageSize=@4,
          @sortBy=@5`,
      [
        searchOptionsDto.farmId,
        fromDate,
        toDate,
        searchOptionsDto.page,
        searchOptionsDto.limit,
        searchOptionsDto.sortBy,
      ],
    );

    let recordsTotal = 0;
    await entities.map(async (item) => {
      recordsTotal = item.total;
      delete item.total;
      return item;
    });
    const pageMetaDto = new PageMetaDto({
      itemCount: recordsTotal,
      pageOptionsDto: searchOptionsDto,
    });
    return new PageDto(entities, pageMetaDto);
  }
}
