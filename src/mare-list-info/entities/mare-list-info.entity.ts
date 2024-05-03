import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { MareList } from 'src/mares-list/entities/mare-list.entity';
import { Farm } from 'src/farms/entities/farm.entity';

@Entity('tblMaresList')
export class MareListInfo extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  maresListUuid: string;

  @Column({ type: 'varchar', nullable: true })
  listname: string;

  @Column()
  listFileName: string;

  @Column()
  listFilePath: string;

  @Column()
  farmId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToMany(() => MareList, (marelist) => marelist.marelistinfo)
  marelists: MareList[];

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;
}
