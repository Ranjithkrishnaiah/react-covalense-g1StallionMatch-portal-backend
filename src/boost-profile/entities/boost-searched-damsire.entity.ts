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
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { BoostProfile } from './boost-profile.entity';

@Entity('tblBoostSearchedDamSire')
export class BoostSearchedDamSire extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  boostProfileId: number;

  @Column()
  horseId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => BoostProfile)
  @JoinColumn({ name: 'boostProfileId', referencedColumnName: 'id' })
  boostprofile: BoostProfile;
}
