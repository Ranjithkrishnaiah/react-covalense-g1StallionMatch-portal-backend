import {
  Inject,
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable({ scope: Scope.REQUEST })
export class SettingService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
  ) {}

  async getData() {
    //Get all list of available max login attempts
    //Get all list of available allowed account suspention length (h)
    //Get all list of available allowed active session length (h)
    let settingItems = await this.settingRepository.find({
      select: ['smSettingKey', 'smSettingValue'],
    });
    let settingDataArray = {
      SM_PORTAL_LOGIN_ATTEMPT_LIMIT: 5,
      SM_ACCONT_SUSPENSION_LENGTH: 24,
      SM_MAX_ALLOWED_SESSION_LENGTH: 12,
    };
    settingItems.forEach(async (item) => {
      if (item.smSettingValue) {
        settingDataArray[item.smSettingKey] = item.smSettingValue;
      }
    });

    return {
      SM_PORTAL_LOGIN_ATTEMPT_LIMIT:
        settingDataArray['SM_PORTAL_LOGIN_ATTEMPT_LIMIT'],
      SM_ACCONT_SUSPENSION_LENGTH:
        settingDataArray['SM_ACCONT_SUSPENSION_LENGTH'],
      SM_MAX_ALLOWED_SESSION_LENGTH:
        settingDataArray['SM_MAX_ALLOWED_SESSION_LENGTH'],
    };
  }

  async findBySettingKey(key: string) {
    const record = await this.settingRepository.findOne({
      select: ['smSettingValue'],
      where: {
        smSettingKey: key,
      },
    });
    if (!record) {
      throw new UnprocessableEntityException('Record not exist!');
    }
    return record.smSettingValue;
  }
}
