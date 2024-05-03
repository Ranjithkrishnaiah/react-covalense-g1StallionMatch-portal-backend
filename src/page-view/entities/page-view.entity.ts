import { Member } from 'src/members/entities/member.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tblPageView')
export class PageView extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entityId: number;

  @Column()
  entityType: string;

  @Column()
  referrer: string;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column()
  countryName: string;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;
}
