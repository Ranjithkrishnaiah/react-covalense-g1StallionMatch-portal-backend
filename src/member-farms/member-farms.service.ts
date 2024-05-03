import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MemberFarm } from './entities/member-farm.entity';
import { CreateFarmMemberDto } from './dto/create-farm-member.dto';
import { FarmProfileImage } from 'src/farm-profile-image/entities/farm-profile-image.entity';
import { AuthFarmsResponseDto } from 'src/auth/dto/auth-farms-response-dto';

@Injectable({ scope: Scope.REQUEST })
export class MemberFarmsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MemberFarm)
    private memberFarmRepository: Repository<MemberFarm>,
  ) {}

  /* Get a record */
  findOne(fields) {
    return this.memberFarmRepository.findOne({
      where: fields,
    });
  }

  /* Create a record */
  async create(farmMember: CreateFarmMemberDto) {
    const record = await this.memberFarmRepository.save(
      this.memberFarmRepository.create(farmMember),
    );
    return record;
  }

  /* Get all member farms */
  async getMemberFarms(): Promise<AuthFarmsResponseDto[]> {
    const member = this.request.user;
    let fpiQueryBuilder = getRepository(FarmProfileImage)
      .createQueryBuilder('fpi')
      .select('fpi.farmId as mediaFarmId, media.mediaUrl as mediaUrl')
      .innerJoin(
        'fpi.media',
        'media',
        'media.id=fpi.mediaId AND media.markForDeletion=0 AND media.fileName IS NOT NULL',
      )
      .andWhere('media.mediaUrl IS NOT NULL')
      .andWhere("media.mediaUrl != ''");

    const queryBuilder = this.memberFarmRepository
      .createQueryBuilder('memberFarm')
      .select(
        'farm.id as id, farm.farmUuid as farmId, farm.farmName as farmName, farm.isActive as isActive, mediaUrl as profilePic',
      )
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect(
        'memberFarm.isFamOwner as isFamOwner, farmaccesslevel.accessName as accessLevel',
      )
      .addSelect('stallion.stallionUuid as stallionId')
      .innerJoin('memberFarm.farm', 'farm')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin(
        '(' + fpiQueryBuilder.getQuery() + ')',
        'farmprofileimage',
        'mediaFarmId=farm.id',
      )
      .leftJoin('farmlocation.state', 'state')
      .leftJoin('memberFarm.farmaccesslevel', 'farmaccesslevel')
      .leftJoin('memberFarm.memberfarmstallion', 'memberfarmstallion')
      .leftJoin('memberfarmstallion.stallion', 'stallion')
      .andWhere('memberFarm.memberId = :memberId', { memberId: member['id'] });
    let records = await queryBuilder.getRawMany();
    let farms = [];
    records.map((element) => {
      if (!farms[element.id]) {
        farms[element.id] = {
          farmId: element.farmId,
          farmName: element.farmName,
          isActive: element.isActive,
          profilePic: element.profilePic,
          countryName: element.countryName,
          countryCode: element.countryCode,
          stateName: element.stateName,
          isFamOwner: element.isFamOwner,
          accessLevel: element.accessLevel,
          stallions: [],
        };
      }
      if (farms[element.id] && element.stallionId) {
        farms[element.id].stallions.push(element.stallionId);
      }
    });
    let finalFarms: any = farms.filter(function (item) {
      return item != null;
    });
    return finalFarms;
  }

  /* Get member farms by member */
  async getMemberFarmsByMemberId(member: any) {
    const queryBuilder = this.memberFarmRepository
      .createQueryBuilder('memberFarm')
      .select('farm.farmUuid as farmId, farm.farmName, farm.url, farm.isActive')
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect(
        'memberFarm.isFamOwner as isFamOwner, farmaccesslevel.accessName as accessLevel',
      )
      .innerJoin('memberFarm.farm', 'farm')
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin('farmlocation.state', 'state')
      .leftJoin('memberFarm.farmaccesslevel', 'farmaccesslevel')
      .andWhere('memberFarm.memberId = :memberId', {
        memberId: member.memberId,
      });
    return await queryBuilder.getRawMany();
  }

  /* Update a record */
  async updateOne(memberFarmId, data) {
    return await this.memberFarmRepository.update(
      {
        id: memberFarmId,
      },
      data,
    );
  }
}
