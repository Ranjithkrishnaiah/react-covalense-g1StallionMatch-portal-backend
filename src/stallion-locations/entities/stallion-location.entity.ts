import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Country } from '../../country/entity/country.entity';
import { State } from '../../states/entities/state.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';

@Entity('tblStallionLocation')
export class StallionLocation extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  stallionId: number;

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true })
  stateId: number;

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

  @OneToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;
}
