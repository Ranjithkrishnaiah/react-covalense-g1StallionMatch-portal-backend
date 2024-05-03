import { Horse } from 'src/horses/entities/horse.entity';
import { Member } from 'src/members/entities/member.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tblSearchStallionMatch')
export class SearchStallionMatch extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stallionId: number;

  @Column()
  mareId: number;

  @Column({ default: false })
  isTwentytwentyMatch: boolean;

  @Column({ default: false })
  isPerfectMatch: boolean;

  @Column()
  ipAddress: string;

  @Column()
  countryName?: string;

  @Column()
  userAgent: string;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'mareId', referencedColumnName: 'id' })
  mare: Horse;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;
}
