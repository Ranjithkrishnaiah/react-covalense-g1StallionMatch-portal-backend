import { Farm } from 'src/farms/entities/farm.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('tblActivityFarmStallion')
export class ActivityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activityTypeId: number;

  @Column()
  farmId: string;

  @Column()
  stallionId: string;

  @Column()
  additionalInfo: string;

  @Column()
  attributeName: string;

  @Column()
  newValue: string;

  @Column()
  oldValue: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column()
  userName: string;

  @Column()
  userEmail: string;

  @Column()
  userCountryId: number;

  @Column()
  createdBy: number;

  @Column()
  createdOn: Date;

  @Column()
  result: string;

  @Column()
  activityModule: string;

  @Column()
  reportType: string;

  @Column()
  entityId: string;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'farmUuid' })
  farm: Farm;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'stallionUuid' })
  stallion: Stallion;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;
}
