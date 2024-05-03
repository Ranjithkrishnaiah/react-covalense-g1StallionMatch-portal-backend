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
import { Country } from 'src/country/entity/country.entity';
import { State } from '../../states/entities/state.entity';

@Entity('tblHomeTestimonial')
export class HomeTestimonial extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  fullname: string;

  @Column({ nullable: false })
  compnay: string;

  @Column({ nullable: false })
  imagepath: string;

  @Column({ nullable: false })
  note: string;

  @Column({ nullable: false })
  isActive: string;

  @Column({ nullable: false })
  createdBy: number;

  @CreateDateColumn({ select: false })
  createdOn: Date;

  @Column({ nullable: false })
  modifiedBy: number;

  @UpdateDateColumn({ default: null, nullable: false, select: false })
  modifiedOn: Date;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'stateId', referencedColumnName: 'id' })
  state: State;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  country: Country;
}
