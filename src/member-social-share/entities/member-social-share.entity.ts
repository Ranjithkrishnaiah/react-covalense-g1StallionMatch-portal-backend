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

@Entity('tblMemberSocialShare')
export class MemberSocialShare extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entityId: number;

  @Column()
  entityType: string;

  @Column()
  socialShareTypeId: number;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;
}
