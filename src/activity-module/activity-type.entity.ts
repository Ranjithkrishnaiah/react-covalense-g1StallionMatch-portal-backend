import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tblActivityType')
export class ActivityType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activityName: string;

  @Column()
  activityTypeCode: string;

  @Column()
  createdBy: number;

  @Column()
  createdOn: Date;

  @Column()
  modifiedBy: number;

  @Column()
  modifiedOn: Date;
}
