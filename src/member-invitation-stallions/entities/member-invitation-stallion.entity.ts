import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { MemberInvitation } from 'src/member-invitations/entities/member-invitation.entity';

@Entity('tblMemberInvitationStallion')
@Unique(['memberInvitationId', 'stallionId'])
export class MemberInvitationStallion extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  memberInvitationId: number;

  @Column({ nullable: true })
  stallionId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @ManyToOne(() => MemberInvitation)
  @JoinColumn({ name: 'memberInvitationId', referencedColumnName: 'id' })
  memberinvitation: MemberInvitation;
}
