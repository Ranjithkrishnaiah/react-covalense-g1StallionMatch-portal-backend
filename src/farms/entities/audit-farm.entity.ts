import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Farm } from './farm.entity';
import { ActivityType } from './activity-type.entity';

@Entity('tblAuditFarm')
export class AuditFarm extends EntityHelper {
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

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'entityId', referencedColumnName: 'farmUuid' })
  farm: Farm;

  @ManyToOne(() => ActivityType)
  @JoinColumn({ name: 'activityType', referencedColumnName: 'id' })
  activity: ActivityType;
}
