import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  BeforeInsert,
  Generated,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Feature } from 'src/feature/entities/feature.entity';
import { MessageType } from 'src/message-types/entities/message-type.entity';
import { Notifications } from 'src/notifications/entities/notifications.entity';

@Entity('tblMessageTemplate')
export class MessageTemplate extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  messageTemplateUuid: string;

  @Column({ unique: true })
  messageTitle: string;

  @Column({ nullable: false })
  messageText: string;

  @Column({ nullable: true })
  msgDescription: string;

  @Column({ nullable: true })
  featureId: number;

  @Column({ nullable: true })
  messageTypeId: number;

  @Column({ nullable: true })
  linkName: string;

  @Column({ nullable: true })
  linkAction: string;

  @Column({ default: false })
  smFrontEnd: boolean;

  @Column({ default: false })
  forAdmin: boolean;

  @Column({ default: false })
  g1Slack: boolean;

  @Column({ default: false })
  breeder: boolean;

  @Column({ default: false })
  farmAdmin: boolean;

  @Column({ default: false })
  farmUser: boolean;

  @Column({ default: false })
  emailSms: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Feature)
  @JoinColumn({ name: 'featureId', referencedColumnName: 'id' })
  feature: Feature;

  @ManyToOne(() => MessageType)
  @JoinColumn({ name: 'messageTypeId', referencedColumnName: 'id' })
  messagetype: MessageType;

  @OneToMany(
    () => Notifications,
    (notifications) => notifications.messagetemplate,
  )
  notification: Notifications[];
}
