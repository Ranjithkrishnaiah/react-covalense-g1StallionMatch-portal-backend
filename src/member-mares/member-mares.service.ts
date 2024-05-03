import {
  Injectable,
  Inject,
  UnprocessableEntityException,
  HttpException,
  HttpStatus,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { HorsesService } from 'src/horses/horses.service';
import { Member } from 'src/members/entities/member.entity';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { Repository, getRepository } from 'typeorm';
import { CreateMemberMareDto } from './dto/create-member-mare.dto';
import { MemberMare } from './entities/member-mare.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorseProfileImage } from 'src/horse-profile-image/entities/horse-profile-image.entity';

@Injectable({ scope: Scope.REQUEST })
export class MemberMaresService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MemberMare)
    private memberMareRepository: Repository<MemberMare>,
    private horsesService: HorsesService,
  ) {}

  /* Create a record */
  async create(member: Member, createMemberMareDto: CreateMemberMareDto) {
    try {
      //Check farm exist
      let horseRecord = await this.horsesService.findOne(
        createMemberMareDto.horseId,
      );
      if (!horseRecord) {
        throw new UnprocessableEntityException('horse not exist!');
      }
      let memberMareRecord = {
        mareId: horseRecord.id,
        memberId: member.id,
        createdBy: member.id,
      };
      //Check Mare already added!
      let mareRecord = await this.memberMareRepository.findOne(
        memberMareRecord,
      );
      if (mareRecord) {
        throw new HttpException(
          'This horse is already listed in your My Horses list.',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      return await this.memberMareRepository.save(
        this.memberMareRepository.create(memberMareRecord),
      );
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  /* Get all records */
  async findAll(
    member: Member,
    pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<MemberMare>> {
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

    const queryBuilder = this.memberMareRepository
      .createQueryBuilder('memberMare')
      .select('memberMare.id as id')
      .addSelect(
        'horse.horseUuid as horseId, horse.horseName as horseName, horse.yob as yob',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect(
        'sire.sireId, sire.sireName, sire.sireYob, sire.sireCountryCode',
      )
      .addSelect('dam.damId, dam.damName, dam.damYob, dam.damCountryCode')
      .addSelect('profileMediaUrl as profilePic')
      .leftJoin(
        'memberMare.horse',
        'horse',
        'horse.isVerified=1 AND horse.isActive=1',
      )
      .innerJoin('horse.nationality', 'country')
      .leftJoin(
        '(' + hpiQueryBuilder.getQuery() + ')',
        'horseprofileimage',
        'mediaHorseId=horse.id',
      )
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
      .andWhere('memberMare.memberId=:memberId', { memberId: member.id })
      .orderBy('horse.horseName', pageOptionsDto.order)
      .offset(pageOptionsDto.skip)
      .limit(pageOptionsDto.limit);

    if (pageOptionsDto.sortBy) {
      const sortBy = pageOptionsDto.sortBy;
      queryBuilder.orderBy('horse.horseName', 'ASC');
      if (sortBy.toLowerCase() === 'age') {
        queryBuilder.orderBy('horse.yob', 'ASC');
      }
      if (sortBy.toLowerCase() === 'country') {
        queryBuilder.orderBy('country.countryCode', 'ASC');
      }
      if (sortBy.toLowerCase() === 'date added') {
        queryBuilder.orderBy('memberMare.createdOn', 'DESC');
      }
    }

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: pageOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  /* Remove a record */
  async remove(deleteMemberMareDto: CreateMemberMareDto) {
    const record = await this.horsesService.findOne(
      deleteMemberMareDto.horseId,
    );
    if (!record) {
      throw new UnprocessableEntityException('Horse not exist!');
    }
    const member = this.request.user;
    const response = await this.memberMareRepository.delete({
      mareId: record.id,
      memberId: member['id'],
    });
    return {
      statusCode: 200,
      message: `This action removes a #${deleteMemberMareDto.horseId} your Mare`,
      data: response,
    };
  }

  /* Get count of records */
  async getCount() {
    const member = this.request.user;
    let memberMareCount = await this.memberMareRepository
      .createQueryBuilder('memberMare')
      .select('memberMare.id as id')
      .andWhere('memberMare.memberId=:memberId', { memberId: member['id'] })
      .getCount();
    return memberMareCount;
  }
}
