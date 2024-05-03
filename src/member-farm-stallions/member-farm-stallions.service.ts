import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MemberFarmStallion } from './entities/member-farm-stallion.entity';
import { MemberFarmStallionDto } from './dto/member-farm-stallion.dto';
import { MemberInvitation } from 'src/member-invitations/entities/member-invitation.entity';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { MemberInvitationStallionsService } from 'src/member-invitation-stallions/member-invitation-stallions.service';

@Injectable({ scope: Scope.REQUEST })
export class MemberFarmStallionsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MemberFarmStallion)
    private memberFarmStallionRepository: Repository<MemberFarmStallion>,
    private memberInvitationStallionsService: MemberInvitationStallionsService,
  ) {}

  /* Get a record */
  findOne(fields) {
    return this.memberFarmStallionRepository.findOne({
      where: fields,
    });
  }

  /* Create record */
  async create(farmMember: MemberFarmStallionDto) {
    const record = await this.memberFarmStallionRepository.save(
      this.memberFarmStallionRepository.create(farmMember),
    );
    return record;
  }

  /* Set Stallions for Invitation */
  async setStallions(invitation: MemberInvitation, memberFarm: MemberFarm) {
    let stallionsList =
      await this.memberInvitationStallionsService.findAllByInvitationId(
        invitation.id,
      );
    let self = this;
    stallionsList.map(async (element) => {
      let farmMemberStallion = new MemberFarmStallionDto();
      farmMemberStallion.memberFarmId = memberFarm.id;
      farmMemberStallion.createdBy = invitation.createdBy;
      farmMemberStallion.stallionId = element.stallionId;
      await self.create(farmMemberStallion);
    });
  }

  /* Delete Record */
  async deleteByMemberFarmId(memberFarmId) {
    await this.memberFarmStallionRepository.delete({
      memberFarmId,
    });
  }
}
