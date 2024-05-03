import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  BeforeInsert,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { Allow } from 'class-validator';
import { EntityHelper } from 'src/utils/entity-helper';

@Entity('tblMemberForgot')
export class Forgot extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Allow()
  @Column()
  @Index()
  hash: string;

  @Allow()
  @ManyToOne(() => Member, {
    eager: true,
  })
  member: Member;

  @CreateDateColumn({
    type: 'datetime2',
  })
  createdOn: Date;

  @Column({
    type: 'datetime2',
  })
  expiredOn: Date;

  @BeforeInsert()
  async setExpiredOn() {
    let exDate = new Date();
    exDate.setDate(exDate.getDate() + 1);
    this.expiredOn = exDate;
  }

  @DeleteDateColumn({
    type: 'datetime2',
  })
  deletedOn: Date;
}
