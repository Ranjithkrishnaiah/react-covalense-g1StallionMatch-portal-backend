import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { Race } from 'src/race/entities/race.entity';
import { FinalPosition } from 'src/runner-final-position/entities/runner-final-position.entity';
import { Horse } from 'src/horses/entities/horse.entity';

@Entity('tblRunner')
export class Runner extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  raceId: number;

  @Column({ nullable: true })
  horseId: number;

  @Column({ nullable: true })
  number: number;

  @Column({ nullable: true })
  barrierId: number;

  @Column({ nullable: true })
  finalPositionId: number;

  @Column({ nullable: true })
  margin: number;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  weightUnitId: number;

  @Column({ nullable: true })
  jokeyId: number;

  @Column({ nullable: true })
  trainerId: number;

  @Column({ nullable: true })
  ownerId: number;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ nullable: true })
  silksColourId: number;

  @Column({ nullable: true })
  prizemoneyWon: number;

  @Column({ nullable: true })
  startingPrice: number;

  @Column({ default: false })
  isApprentice: boolean;

  @Column({ default: false })
  isScratched: boolean;

  @Column({ default: true })
  isEligible: boolean;

  @Column({ nullable: true })
  sourceId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Race)
  @JoinColumn({ name: 'raceId', referencedColumnName: 'id' })
  races: Race;

  @ManyToOne(() => FinalPosition)
  @JoinColumn({ name: 'finalPositionId', referencedColumnName: 'id' })
  positions: FinalPosition;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'horseId', referencedColumnName: 'id' })
  horse: Horse;
}
