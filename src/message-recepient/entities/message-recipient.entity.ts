import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Message } from 'src/messages/entities/messages.entity';
import { Member } from 'src/members/entities/member.entity';
import { MessageChannel } from 'src/message-channel/entities/message-channel.entity';

@Entity('tblMessageRecipient')
export class MessageRecipient extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  messageId: number;

  @Column()
  recipientId: number;

  @Column()
  recipientEmail: string;

  @Column()
  channelId: number;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'messageId', referencedColumnName: 'id' })
  message: Message;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'recipientId', referencedColumnName: 'id' })
  recipient: Member;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  sender: Member;

  @ManyToOne(() => MessageChannel)
  @JoinColumn({ name: 'channelId', referencedColumnName: 'id' })
  channel: MessageChannel;
}
