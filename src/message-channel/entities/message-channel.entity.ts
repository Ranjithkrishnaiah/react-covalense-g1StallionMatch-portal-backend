import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { EntityHelper } from '../../utils/entity-helper';
import { Member } from 'src/members/entities/member.entity';
import { MessageRecipient } from 'src/message-recepient/entities/message-recipient.entity';

@Entity('tblMessageChannel')
export class MessageChannel extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  txId: number;

  @Column()
  txEmail: string;

  @Column()
  rxId: number;

  @Column()
  channelUuid: string;

  @Column({ default: 1 })
  isActive: boolean;

  @Column({ default: 0 })
  isFlagged: boolean;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'txId', referencedColumnName: 'id' })
  member: Member;

  @OneToMany(
    () => MessageRecipient,
    (messagerecipient) => messagerecipient.channel,
  )
  messagerecipient: MessageRecipient[];
}
