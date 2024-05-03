import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblRunnerFinalPosition')
export class FinalPosition extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  displayName: string;

  @Column({ type: 'varchar' })
  importedName: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  isEligibleRun: boolean;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @Column({ nullable: true })
  position: number;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;
}
