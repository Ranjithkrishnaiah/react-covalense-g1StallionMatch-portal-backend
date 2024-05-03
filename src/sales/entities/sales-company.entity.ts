import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Country } from '../../country/entity/country.entity';

@Entity('tblSalesCompany')
export class SalesCompany extends EntityHelper {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar' })
  salescompanyName: string;

  @Column({ type: 'int', nullable: true })
  countryId: number;

  @Column({ type: 'varchar' })
  salescompanyAddress: string;

  @Column({ type: 'varchar' })
  salescompanyWebsite: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  country: Country;
}
