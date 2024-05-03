import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { MareListInfo } from 'src/mare-list-info/entities/mare-list-info.entity';

@Entity('tblMaresListInfo')
export class MareList extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  marelistid: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  year: number;

  @Column({ nullable: true })
  sire: string;

  @Column({ nullable: true })
  dam: string;

  @Column({ nullable: true })
  damcountry: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => MareListInfo)
  @JoinColumn({ name: 'marelistid', referencedColumnName: 'id' })
  marelistinfo: MareListInfo;
}
