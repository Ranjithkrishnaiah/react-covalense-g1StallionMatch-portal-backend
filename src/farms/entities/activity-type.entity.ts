import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { AuditFarm } from './audit-farm.entity';
import { AuditStallion } from 'src/stallions/entities/audit-stallion.entity';

@Entity('tblActivityType')
export class ActivityType extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activityName: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  modifiedBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @CreateDateColumn()
  modifiedOn: Date;

  @OneToMany(() => AuditFarm, (auditFarm) => auditFarm.activity)
  auditFarm: AuditFarm[];

  @OneToMany(
    () => AuditStallion,
    (stalionAuditFarm) => stalionAuditFarm.activity,
  )
  stalionAuditFarm: AuditStallion[];
}
