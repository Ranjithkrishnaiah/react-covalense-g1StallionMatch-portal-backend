import { Country } from 'src/country/entity/country.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Member } from 'src/members/entities/member.entity';
import { SalesCompany } from '../entities/sales-company.entity';
import { SalesStatus } from '../entities/sales-status.entity';
import { SalesLot } from 'src/sales-lots/entities/sales-lot.entity';

@Entity('tblSales')
export class Sale extends BaseEntity {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  salesName: string;

  @Column()
  salesCode: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  countryId: number;

  @Column()
  statusId: number;

  @CreateDateColumn({ select: false })
  createdOn: Date;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  location: Country;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  country: Country;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;

  @ManyToOne(() => SalesCompany)
  @JoinColumn({ name: 'salesCompanyId', referencedColumnName: 'Id' })
  salesCompany: SalesCompany;

  @ManyToOne(() => SalesStatus)
  @JoinColumn({ name: 'statusId', referencedColumnName: 'id' })
  salesStatus: SalesStatus;

  @OneToMany(() => SalesLot, (lot) => lot.Id)
  salesLot: SalesLot;
}
