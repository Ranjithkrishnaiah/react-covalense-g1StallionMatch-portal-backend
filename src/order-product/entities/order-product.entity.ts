import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';
import { OrderStatus } from 'src/order-status/entities/order-status.entity';
import { OrderReport } from 'src/order-report/entities/order-report.entity';
import { ReportProductItem } from 'src/report-product-items/entities/report-product-item.entity';
import { OrderTransaction } from 'src/order-transaction/entities/order-transaction.entity';

@Entity('tblOrderProduct')
export class OrderProduct extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column()
  productId: number;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @Column()
  pdfLink: string;

  @Column()
  isLinkActive: boolean;

  @Column()
  orderStatusId: number;

  @Column({ nullable: true })
  selectedPriceRange: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId', referencedColumnName: 'id' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product;

  @ManyToOne(() => OrderStatus)
  @JoinColumn({ name: 'orderStatusId', referencedColumnName: 'id' })
  orderstatus: OrderStatus;

  @OneToMany(() => OrderProductItem, (orderProductItem) => orderProductItem.orderproduct)
  orderProductItem: OrderProductItem[];

  @OneToMany(() => OrderReport, (orderReport) => orderReport.orderProduct)
  orderReportStatus: OrderReport;

  @OneToMany(() => ReportProductItem, (reportProductItem) => reportProductItem.orderproduct)
  reportProductItem: ReportProductItem[];

  @OneToMany(() => OrderTransaction, (orderTransaction) => orderTransaction.orderproduct)
  OrderTransaction: OrderTransaction[];


}
