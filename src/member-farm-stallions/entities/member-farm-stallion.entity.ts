import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';

@Entity('tblMemberFarmStallion')
@Unique(['memberFarmId', 'stallionId'])
export class MemberFarmStallion extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  memberFarmId: number;

  @Column({ nullable: true })
  stallionId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => MemberFarm)
  @JoinColumn({ name: 'memberFarmId', referencedColumnName: 'id' })
  memberfarm: MemberFarm;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;
}
