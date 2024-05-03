import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RegisterInterest } from '../../register-interests/entity/register-interest.entity';

@Entity('tblRegisterInterestType')
@Unique(['registerInterestTypeName'])
export class RegisterInterestType extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  registerInterestTypeName: string;

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn({ default: null, nullable: true })
  modifiedOn: Date;

  @OneToMany(
    () => RegisterInterest,
    (registerinterest) => registerinterest.registerInterestTypeId,
  )
  registerinterest: RegisterInterest[];
}
