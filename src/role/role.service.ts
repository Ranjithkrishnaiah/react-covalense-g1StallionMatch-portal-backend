import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable({ scope: Scope.REQUEST })
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {
    console.log('::: ROLE SERVICE :::: ROLE SERVICE ::: INITIALISED :::');
  }

  async findOne(id: number) {
    return await this.roleRepository.find({
      where: { Id: id },
    });
  }
  async findScopes(
    scopeType: string,
    apiId: string,
    memberId: string,
    farmId: string,
    roleId: number,
  ) {
    return await this.roleRepository.manager.query(
      `EXEC procGetMemberPermissions 
                     @ScopeType=@0,
                     @ApiId=@1,
                     @MemberId=@2,
                     @FarmId=@3,
                     @RoleId=@4`,
      [scopeType, apiId, memberId, farmId, roleId],
    );
  }
  async findStallionGaurdScopes(
    scopeType: string,
    apiId: string,
    memberId: string,
    stallionId: string,
    roleId: number,
  ) {
    return await this.roleRepository.manager.query(
      `EXEC procGetMemberStallionGaurdRules 
                     @ScopeType=@0,
                     @ApiId=@1,
                     @MemberId=@2,
                     @StallionUuId=@3,
                     @RoleId=@4`,
      [scopeType, apiId, memberId, stallionId, roleId],
    );
  }
}
