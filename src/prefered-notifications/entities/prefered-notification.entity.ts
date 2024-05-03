import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { NotificationType } from 'src/notification-types/entities/notification-type.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('tblMemberPreferedNotification')
export class PreferedNotification extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'smallint', nullable: true })
  notificationTypeId: number;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  memberId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => NotificationType)
  @JoinColumn({ name: 'notificationTypeId', referencedColumnName: 'id' })
  notificationtype: NotificationType;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId', referencedColumnName: 'id' })
  member: Member;
}
