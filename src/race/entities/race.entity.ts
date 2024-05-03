import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Horse } from 'src/horses/entities/horse.entity';
import { Runner } from 'src/runner/entities/runner.entity';
@Entity('tblRace')
export class Race extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  raceUuid: string;

  @Column()
  sourceId: number;

  @Column()
  raceDate: Date;

  @Column({ type: 'time' })
  raceTime: Date;

  @Column()
  venueId: number;

  @Column()
  trackTypeId: number;

  @Column()
  trackConditionId: number;

  @Column({ type: 'varchar' })
  displayName: string;

  @Column({ type: 'varchar' })
  importedName: string;

  @Column({ type: 'decimal' })
  raceDistance: number;

  @Column({ type: 'int' })
  distanceUnitId: number;

  @Column({ type: 'int' })
  raceAgeRestrictionId: number;

  @Column({ type: 'int' })
  raceSexRestrictionId: number;

  @Column({ type: 'int' })
  raceClassId: number;

  @Column({ type: 'int' })
  raceStakeId: number;

  @Column({ type: 'int' })
  currencyId: number;

  @Column({ type: 'decimal' })
  racePrizemoney: number;

  @Column({ type: 'int' })
  raceTypeId: number;

  @Column({ type: 'int' })
  raceWeatherId: number;

  @Column({ type: 'int' })
  raceStatusId: number;

  @Column()
  isEligible: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @OneToMany(() => Runner, (runner) => runner.races)
  runners: Runner[];

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'raceStakeId', referencedColumnName: 'id' })
  races: Horse;
}
