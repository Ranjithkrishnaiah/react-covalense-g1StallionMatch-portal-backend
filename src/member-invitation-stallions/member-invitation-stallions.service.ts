import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MemberInvitationStallion } from './entities/member-invitation-stallion.entity';
import { CreateMemberInvitationStallionsDto } from './dto/create-invitation-member-stallions.dto';

@Injectable({ scope: Scope.REQUEST })
export class MemberInvitationStallionsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MemberInvitationStallion)
    private memberInvitationStallionsRepository: Repository<MemberInvitationStallion>,
  ) {}

  /* Get a record */
  findOne(fields) {
    return this.memberInvitationStallionsRepository.findOne({
      where: fields,
    });
  }

  /* Create a record */
  async create(
    createMemberInvitationStallionsDto: CreateMemberInvitationStallionsDto,
  ) {
    const record = await this.memberInvitationStallionsRepository.save(
      this.memberInvitationStallionsRepository.create(
        createMemberInvitationStallionsDto,
      ),
    );
    return record;
  }

  /* Get all invitations */
  async findAll() {
    const member = this.request.user;
    const queryBuilder = this.memberInvitationStallionsRepository
      .createQueryBuilder('memberInvStallion')
      .select('farm.farmUuid as farmId, farm.farmName as farmName')
      .addSelect(
        'country.countryName as countryName, country.countryCode as countryCode',
      )
      .addSelect('state.stateName as stateName')
      .addSelect(
        'memberFarm.isFamOwner as isFamOwner, farmaccesslevel.accessName as accessLevel',
      )
      .innerJoin(
        'memberFarm.farm',
        'farm',
        'farm.isVerified=1 AND farm.isActive=1',
      )
      .innerJoin('farm.farmlocations', 'farmlocation')
      .innerJoin('farmlocation.country', 'country')
      .leftJoin('farmlocation.state', 'state')
      .leftJoin('memberFarm.farmaccesslevel', 'farmaccesslevel')
      .andWhere('memberFarm.memberId = :memberId', { memberId: member['id'] });
    return await queryBuilder.getRawMany();
  }

  /* Get all by invitationId */
  async findAllByInvitationId(invitationId: number) {
    const queryBuilder = this.memberInvitationStallionsRepository
      .createQueryBuilder('memberInvStallion')
      .select('memberInvStallion.stallionId as stallionId')
      .andWhere('memberInvStallion.memberInvitationId = :memberInvitationId', {
        memberInvitationId: invitationId,
      });
    return await queryBuilder.getRawMany();
  }

  /* Get all stallionIds by invitationId */
  async getStallionIdsByInvitationId(invitationId: number) {
    const queryBuilder = this.memberInvitationStallionsRepository
      .createQueryBuilder('memberInvStallion')
      .select('stallion.stallionUuid as stallionId')
      .innerJoin(
        'memberInvStallion.stallion',
        'stallion',
        'stallion.id=memberInvStallion.stallionId',
      )
      .andWhere('memberInvStallion.memberInvitationId = :memberInvitationId', {
        memberInvitationId: invitationId,
      });
    return await queryBuilder.getRawMany();
  }

  /* Remove all by invitationId */
  async removeAllByMemberInvitationId(memberInvitationId) {
    return await this.memberInvitationStallionsRepository.delete({
      memberInvitationId: memberInvitationId,
    });
  }
}
