import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  Generated,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { BoostProfile } from './boost-profile.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('tblBoostStallion')
export class BoostStallion extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  boostProfileId: number;

  @Column()
  stallionId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => BoostProfile)
  @JoinColumn({ name: 'boostProfileId', referencedColumnName: 'id' })
  boostprofile: BoostProfile;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;

}
