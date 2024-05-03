import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tblAuditFarm')
export class FarmAuditEntity {
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

  @Column()
  createdOn: Date;
}
