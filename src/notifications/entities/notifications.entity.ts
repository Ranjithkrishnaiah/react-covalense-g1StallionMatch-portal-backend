import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  Index,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { MessageTemplate } from 'src/message-templates/entities/message-template.entity';
import { Member } from 'src/members/entities/member.entity';
import { NotificationType } from 'src/notification-types/entities/notification-type.entity';

@Entity('tblNotification')
export class Notifications extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  notificationUuid: string;

  @Column({ nullable: true })
  notificationShortUrl: string;

  @Column({ nullable: true })
  actionUrl: string;

  @Column({ nullable: true })
  messageTemplateId: number;

  @Column({ nullable: true })
  recipientId: number;

  @Column({ nullable: true })
  messageTitle: string;

  @Column({ nullable: true })
  messageText: string;

  @Column({ default: false })
  isRead: boolean;

  @Column()
  notificationType: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @Column({ nullable: true })
  farmid: number;
  
  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => MessageTemplate)
  @JoinColumn({ name: 'messageTemplateId', referencedColumnName: 'id' })
  messagetemplate: MessageTemplate;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'recipientId', referencedColumnName: 'id' })
  recipient: Member;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  sender: Member;

  @ManyToOne(() => NotificationType)
  @JoinColumn({ name: 'notificationType', referencedColumnName: 'id' })
  notificationtype: NotificationType;
}
