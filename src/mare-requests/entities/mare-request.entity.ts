import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Country } from 'src/country/entity/country.entity';

@Entity('tblMareRequest')
export class MareRequest extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  mareRequestUuid: string;

  @Column({ type: 'varchar', nullable: true })
  horseName: string;

  @Column({ type: 'smallint', nullable: true })
  yob: number;

  @Column()
  countryId: number;

  @Column()
  horseId: number;
  
  @Column()
  isApproved: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  nationality: Country;
}
