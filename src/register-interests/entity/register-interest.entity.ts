import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Generated,
  JoinColumn,
} from 'typeorm';
import { Country } from '../../country/entity/country.entity';
import { RegisterInterestType } from 'src/register-interest-types/entity/register-interest-type.entity';
import { EntityHelper } from 'src/utils/entity-helper';

@Entity('tblRegisterInterest')
@Unique(['email', 'registerInterestTypeId'])
export class RegisterInterest extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  registerInterestUuid: string;

  @Column({ type: 'varchar', nullable: true })
  fullName: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ nullable: true })
  registerInterestTypeId: number;

  @Column({ type: 'varchar', nullable: true })
  farmName: string;

  @Column({ type: 'int', nullable: true })
  countryId: number;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', nullable: true })
  userAgent: string;

  @Column({ default: true })
  isSubscribed: boolean;

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn({ default: null, nullable: true })
  modifiedOn: Date;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  country: Country;

  @ManyToOne(() => RegisterInterestType)
  @JoinColumn({ name: 'registerInterestTypeId', referencedColumnName: 'id' })
  registerinteresttype: RegisterInterestType;
}
