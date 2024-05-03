import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  Generated,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { BoostType } from './boost-type.entity';
import { BoostStallion } from './boost-stallion.entity';

@Entity('tblBoostProfile')
export class BoostProfile extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  boostUuid: string;

  @Column()
  message: string;

  @Column()
  boostTypeId: number;

  @Column({ default: false })
  isTrackedFarmStallion: boolean;

  @Column({ default: false })
  isSearchedFarmStallion: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => BoostType)
  @JoinColumn({ name: 'boostTypeId', referencedColumnName: 'id' })
  boosttype: BoostType;

  @OneToMany(() => BoostStallion, (booststallion) => booststallion.boostprofile)
  booststallion: BoostStallion[];

}
