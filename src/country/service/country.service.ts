import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager } from 'typeorm';
import { CountryResponseDto } from '../dto/country-response.dto';
import { CountrySearchDto } from '../dto/country-search.dto';
import { CountryWithStateResponseDto } from '../dto/country-with-state-response.dto';
import { CountryRepository } from '../repository/country.repository';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(CountryRepository)
    private countryRepository: CountryRepository,
  ) {}

  /* Get All Countries */
  async getAllCountries(
    countrySearchDto: CountrySearchDto,
  ): Promise<CountryResponseDto[]> {
    const queryBuilder = getManager()
      .createQueryBuilder()
      .addSelect(
        'c.id as id, c.countryName, c.countryCode, c.countryA2Code, c.regionId, c.preferredCurrencyId, c.isDisplay',
      )
      .from('tblCountry', 'c')
      .andWhere('c.isDisplay = :isDisplay', { isDisplay: true })
      .addOrderBy('c.countryName', 'ASC');
    if (countrySearchDto.searchBy && countrySearchDto.searchBy.length > 2) {
      queryBuilder.andWhere('c.countryName like :countryName', {
        countryName: `%${countrySearchDto.searchBy}%`,
      });
    }
    const entities = await queryBuilder.getRawMany();
    return entities; //
  }

  /* Get All Countries With States */
  async getAllCountriesWithStates(): Promise<CountryWithStateResponseDto> {
    const q = getManager()
      .createQueryBuilder()
      .addSelect('c.id, c.countryName, c.countryCode')
      .addSelect('s.id AS stateId, s.stateName')
      .from('tblCountry', 'c')
      .leftJoin('tblState', 's', 'c.id = s.countryId and s.isDisplay=1')
      .andWhere('c.isDisplay = :isCountryDisplay', {
        isCountryDisplay: true,
      })
      .addOrderBy('c.countryName', 'ASC');
    const dbList = await q.getRawMany();
    let countryStatesList = [];
    dbList.map((record: any) => {
      if (!countryStatesList[record.id]) {
        countryStatesList[record.id] = {
          countryId: record.id,
          label: record.countryName,
          countryCode: record.countryCode,
          children: [],
        };
      }
      if (record.stateId) {
        let state = {
          countryId: record.id,
          stateId: record.stateId,
          label: record.stateName,
          expanded: true,
        };
        countryStatesList[record.id].children.push(state);
      }
    });
    countryStatesList.sort((a, b) => a.label.localeCompare(b.label));
    let finalList: any = countryStatesList.filter(function (item) {
      return item != null;
    });
    return finalList;
  }

  /* Get Country With States By countryId */
  async findByCountryId(id: number) {
    const q = getManager()
      .createQueryBuilder()
      .addSelect('c.id as countryId, c.countryName, c.countryCode')
      .addSelect('s.id AS stateId, s.stateName')
      .from('tblCountry', 'c')
      .leftJoin('tblState', 's', 'c.id = s.countryId and s.isDisplay=1')
      .andWhere('c.isDisplay = :isCountryDisplay', {
        isCountryDisplay: true,
      })
      .andWhere('c.id = :id', { id: id })
      .addOrderBy('s.stateName', 'ASC');

    const cntyList = await q.getRawMany();
    let countryStatesList;
    let states = [];
    for (let i = 0; i < cntyList.length; i++) {
      if (i == 0) {
        countryStatesList = {
          countryId: cntyList[i].countryId,
          countryName: cntyList[i].countryName,
          countryCode: cntyList[i].countryCode,
        };
      }
      states.push({
        stateId: cntyList[i].stateId,
        stateName: cntyList[i].stateName,
      });
    }
    if (states.length) countryStatesList['states'] = states;

    return countryStatesList;
  }

  /* Get Country By countryId */
  async getCountryById(id: number) {
    const record = await this.countryRepository.findOne({ id });
    if (!record) {
      throw new UnprocessableEntityException('country not exist!');
    }
    return record;
  }

  /* Get Country List For Footer Display */
  async getCountryListForFooterDisplay() {
    let countryCodes = [
      'AUS',
      'USA',
      'NZL',
      'JPN',
      'CAN',
      'ZAF',
      'GBR',
      'IRE',
      'FRA',
      'GER',
      'ITA',
    ];
    let queryBuilder = this.countryRepository
      .createQueryBuilder('country')
      .select(
        'country.id as id, country.countryName as countryName, country.countryCode as countryCode',
      )
      .andWhere('country.countryCode IN(:...countryCodes)', {
        countryCodes: countryCodes,
      });
    const queryBuilderOutput = await queryBuilder.getRawMany();
    let countryList = [];
    countryCodes.map((item) => {
      let cnty = queryBuilderOutput.filter((obj) => {
        if (obj.countryCode === item) return obj;
      })
      if (cnty.length > 0) {
        countryList.push(cnty[0])
      }
    });
    return countryList;
  }
}
