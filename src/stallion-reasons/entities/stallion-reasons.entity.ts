import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { Stallion } from 'src/stallions/entities/stallion.entity';

@Entity('tblStallionReason')
export class StallionReason extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reasonName: string;

  @CreateDateColumn({ select: false })
  createdOn: Date;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @OneToMany(() => Stallion, (stallion) => stallion.stallionreason)
  stallions: Stallion[];

  @BeforeInsert()
  hashPassword() {}
}
