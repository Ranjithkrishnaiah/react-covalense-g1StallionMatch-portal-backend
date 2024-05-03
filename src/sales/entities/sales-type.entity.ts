import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Country } from '../../country/entity/country.entity';
import { SalesLot } from 'src/sales-lots/entities/sales-lot.entity';

@Entity('tblSalesType')
export class Salestype extends EntityHelper {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar' })
  salesTypeName: string;

  @Column({ type: 'int', nullable: true })
  salesTypeDescription: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToMany(() => SalesLot, (salesLot) => salesLot.Id)
  salesLot: SalesLot;
}
