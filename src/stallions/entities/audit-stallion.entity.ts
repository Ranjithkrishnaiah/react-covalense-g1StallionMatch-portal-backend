import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from './stallion.entity';
import { ActivityType } from 'src/farms/entities/activity-type.entity';

@Entity('tblAuditStallion')
export class AuditStallion extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activityType: number;

  @Column()
  entityId: string;

  @Column()
  attributeName: string;

  @Column()
  newValue: string;

  @Column()
  oldValue: string;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'entityId', referencedColumnName: 'stallionUuid' })
  stallion: Stallion;

  @ManyToOne(() => ActivityType)
  @JoinColumn({ name: 'activityType', referencedColumnName: 'id' })
  activity: ActivityType;
}
