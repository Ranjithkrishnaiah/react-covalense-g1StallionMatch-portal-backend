import { EntityRepository, Repository } from 'typeorm';
import { RegisterInterestType } from '../entity/register-interest-type.entity';

@EntityRepository(RegisterInterestType)
export class RegisterInterestTypeRepository extends Repository<RegisterInterestType> {}
