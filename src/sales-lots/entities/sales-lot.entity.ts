import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
  OneToOne,
  Generated,
  Index,
} from 'typeorm';
import { Horse } from 'src/horses/entities/horse.entity';
import { Salestype } from 'src/sales/entities/sales-type.entity';
import { SalesLotInfoTemp } from 'src/sales/entities/sale-lot-info-temp.entity';

@Entity('tblSalesLot')
export class SalesLot extends BaseEntity {
  @PrimaryGeneratedColumn()
  Id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  salesLotUuid: string;

  @Column({ type: 'int' })
  salesId: number;

  @Column()
  isNamed: boolean;

  @Column({ type: 'int' })
  bookNumber: number;

  @Column({ type: 'int' })
  dayNumber: number;

  @Column({ type: 'varchar' })
  lotCode: string;

  @Column({ type: 'int' })
  lotNumber: number;

  @Column({ type: 'int' })
  lotType: number;

  @Column({ type: 'int' })
  horseId: number;

  @Column({ type: 'varchar' })
  horseGender: string;

  @Column({ type: 'varchar' })
  venderName: string;

  @Column({ type: 'varchar' })
  buyerName: string;

  @Column({ type: 'varchar' })
  buyerLocation: string;

  @Column({ type: 'varchar' })
  price: string;

  @Column({ type: 'int' })
  priceCurrencyId: number;

  @Column({ type: 'varchar' })
  coveringStallionName: string;

  @Column({ nullable: true })
  isWithdrawn: boolean;

  @Column({ nullable: true })
  notMatchedLot: boolean;

  @Column({ nullable: true })
  notMatchedSireDam: boolean;

  @Column({ nullable: true })
  isVerified: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  modifiedBy: number;

  @Column({ nullable: true })
  isSelectedForSetting: boolean;

  @UpdateDateColumn()
  modifiedOn: Date;

  @Column({ nullable: true })
  verifiedBy: number;

  @UpdateDateColumn()
  verifiedOn: Date;

  @OneToOne(() => Horse)
  @JoinColumn({ name: 'horseId', referencedColumnName: 'id' })
  horse: Horse;

  @ManyToOne(() => Salestype)
  @JoinColumn({ name: 'lotType', referencedColumnName: 'Id' })
  salestype: Salestype;

  @ManyToOne(() => Sale)
  @JoinColumn({ name: 'salesId', referencedColumnName: 'Id' })
  sales: Sale;

  @ManyToOne(() => Salestype)
  @JoinColumn({ name: 'lotType', referencedColumnName: 'Id' })
  lottype: Salestype;

  @OneToMany(
    () => OrderProductItem,
    (orderproductitems) => orderproductitems.saleslot,
  )
  orderproductitem: OrderProductItem[];

  @OneToOne(
    () => SalesLotInfoTemp,
    (salesLotInfoTemp) => salesLotInfoTemp.salesLot,
  )
  salesLotInfoTemp: SalesLotInfoTemp[];
}
