import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Farm } from 'src/farms/entities/farm.entity';
import { FarmMediaFile } from 'src/farm-media-files/entities/farm-media-file.entity';

@Entity('tblFarmMediaInfo')
export class FarmMediaInfo extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  farmId: number;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @Column({ nullable: true })
  deletedBy: number;

  @DeleteDateColumn()
  deletedOn: Date;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;

  @OneToMany(
    () => FarmMediaFile,
    (farmmediafile) => farmmediafile.farmmediainfo,
  )
  farmmediafile: FarmMediaFile[];
}
