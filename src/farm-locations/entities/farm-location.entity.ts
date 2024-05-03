import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Country } from '../../country/entity/country.entity';
import { State } from '../../states/entities/state.entity';
import { Farm } from '../../farms/entities/farm.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('tblFarmLocation')
export class FarmLocation extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  farmId: number;

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true })
  stateId: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  postcode: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  country: Country;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'stateId', referencedColumnName: 'id' })
  state: State;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  createdby: Member;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'modifiedBy', referencedColumnName: 'id' })
  modifiedby: Member;
}
