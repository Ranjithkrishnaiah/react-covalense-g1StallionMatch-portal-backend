import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { RegisterInterest } from '../entity/register-interest.entity';
import { SubscribeDto } from '../dto/subscribe.dto';

@EntityRepository(RegisterInterest)
export class RegisterInterestRepository extends Repository<RegisterInterest> {
  async registerIntrest(
    request: Request,
    formData,
    typeId: number,
  ): Promise<{ message: string }> {
    try {
      const { name, email, countryId } = formData;
      const record = new RegisterInterest();
      record.registerInterestUuid = uuidv4();
      record.isSubscribed = true;
      record.fullName = name;
      record.email = email;
      if (formData?.farmName) {
        record.farmName = formData?.farmName;
      }
      record.registerInterestTypeId = typeId;
      record.countryId = countryId;
      record.userAgent = request.headers['user-agent'];
      record.ipAddress = request.socket['remoteAddress'];
      record.createdOn = new Date();
      await record.save();

      return { message: 'Your interest successfully submitted!' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async subscribe(
    request: Request,
    formData: SubscribeDto,
    registerInterestTypeId: number,
  ): Promise<{ message: string }> {
    try {
      const { email } = formData;
      const record = new RegisterInterest();
      record.registerInterestUuid = uuidv4();
      record.isSubscribed = true;
      record.email = email;
      record.registerInterestTypeId = registerInterestTypeId;
      record.userAgent = request.headers['user-agent'];
      record.ipAddress = request.socket['remoteAddress'];
      record.createdOn = new Date();
      await record.save();

      return { message: 'Your have subscribed successfully!' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async unSubscribe(record: RegisterInterest): Promise<{ message: string }> {
    try {
      record.isSubscribed = false;
      await record.save();

      return { message: 'Your have unsubscribed successfully!' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async reSubscribe(record: RegisterInterest): Promise<{ message: string }> {
    try {
      record.isSubscribed = true;
      await record.save();

      return { message: 'Your have subscribed successfully!' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
