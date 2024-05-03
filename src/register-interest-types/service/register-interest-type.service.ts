import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterInterestType } from '../entity/register-interest-type.entity';
import { RegisterInterestTypeRepository } from '../repository/register-interest-type.repository';

@Injectable()
export class RegisterInterestTypeService {
  constructor(
    @InjectRepository(RegisterInterestType)
    private typeRepository: RegisterInterestTypeRepository,
  ) {}

  /* Get Register Breeder Interest By RoleId */
  async getRegisterBreederInterestRoleId() {
    const registerInterestTypeName = 'RegisterBreederInterest';
    const record = await this.typeRepository.findOne({
      registerInterestTypeName,
    });
    if (!record) {
      throw new ForbiddenException('Record not exist');
    }
    return record.id;
  }

  /* Get Subscribe Insights Report By RoleId */
  async getSubscribeInsightsReportRoleId() {
    const registerInterestTypeName = 'SubscribeInsightsReport';
    const record = await this.typeRepository.findOne({
      registerInterestTypeName,
    });
    if (!record) {
      throw new ForbiddenException('Record not exist');
    }
    return record.id;
  }

  /* Get Subscribe Farm By RoleId */
  async getSubscribeFarmRoleId() {
    const registerInterestTypeName = 'SubscribeFarm';
    const record = await this.typeRepository.findOne({
      registerInterestTypeName,
    });
    if (!record) {
      throw new ForbiddenException('Record not exist');
    }
    return record.id;
  }
}
