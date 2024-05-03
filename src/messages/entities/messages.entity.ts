import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Farm } from 'src/farms/entities/farm.entity';
import { Member } from 'src/members/entities/member.entity';
import { MessageRecipient } from 'src/message-recepient/entities/message-recipient.entity';
import { NominationRequest } from 'src/nomination-request/entities/nomination-request.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { MessageMedia } from 'src/message-media/entities/message-media.entity';

@Entity('tblMessage')
export class Message extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fromMemberId: number;

  @Column({ nullable: false })
  farmId: number;

  @Column()
  stallionId: number;

  @Column()
  nominationRequestId: number;

  @Column({ nullable: false })
  message: string;

  @Column()
  subject: string;

  @Column()
  fullName: string;

  @Column()
  fromName: string;

  @Column()
  email: string;

  @Column()
  mareId: number;

  @Column()
  mareName: string;

  @Column()
  cob: number;

  @Column()
  yob: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  sender: Member;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'fromMemberId', referencedColumnName: 'id' })
  frommember: Member;

  @ManyToOne(() => NominationRequest)
  @JoinColumn({ name: 'nominationRequestId', referencedColumnName: 'id' })
  nominationrequest: NominationRequest;

  @OneToMany(
    () => MessageRecipient,
    (messagerecipient) => messagerecipient.message,
  )
  messagerecipient: MessageRecipient[];

  @OneToMany(() => MessageMedia, (messagemedia) => messagemedia.message)
  messagemedia: MessageMedia[];
}
