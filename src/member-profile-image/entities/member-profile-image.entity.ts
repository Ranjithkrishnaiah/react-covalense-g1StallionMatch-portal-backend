import { Media } from 'src/media/entities/media.entity';
import { Member } from 'src/members/entities/member.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tblMemberProfileImage')
export class MemberProfileImage extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  memberId: number;

  @Column({ nullable: true })
  mediaId: number;

  @ManyToOne(() => Media)
  @JoinColumn({ name: 'mediaId', referencedColumnName: 'id' })
  media: Media;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId', referencedColumnName: 'id' })
  member: Member;
}
