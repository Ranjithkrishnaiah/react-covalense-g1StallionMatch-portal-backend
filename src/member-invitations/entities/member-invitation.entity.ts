import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Farm } from 'src/farms/entities/farm.entity';
import { FarmAccessLevel } from 'src/farm-access-levels/entities/farm-access-level.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('tblMemberInvitation')
export class MemberInvitation extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  farmId: number;

  @Column({ nullable: true })
  accessLevelId: number;

  @Column({ nullable: true })
  memberId: number;

  @Column({ nullable: true })
  @Index()
  hash: string;

  @Column({ default: false, nullable: false })
  isAccepted: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @Column({
    type: 'datetime2',
  })
  expiredOn: Date;

  @BeforeInsert()
  async setExpiredOn() {
    let exDate = new Date();
    exDate.setDate(exDate.getDate() + 2);
    this.expiredOn = exDate;
  }

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;

  @ManyToOne(() => FarmAccessLevel)
  @JoinColumn({ name: 'accessLevelId', referencedColumnName: 'id' })
  farmaccesslevel: FarmAccessLevel;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId', referencedColumnName: 'id' })
  member: Member;
}
