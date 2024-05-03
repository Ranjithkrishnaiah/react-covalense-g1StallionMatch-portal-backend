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

@Entity('tblBoostType')
export class BoostType extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  boostTypeName: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;
}
