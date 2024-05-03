import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Order } from 'src/orders/entities/order.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { PaymentStatus } from 'src/payment-status/entities/payment-status.entity';
import { PaymentMethod } from 'src/payment-methods/entities/payment-method.entity';
import { PromoCode } from 'src/promo-codes/entities/promo-code.entity';
import { IsUUID, IsString } from 'class-validator';

@Entity('tblOrderTransaction')
export class OrderTransaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column()
  couponId: number;

  @Column()
  sessionId: string;

  @Column()
  memberId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  taxPercent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  taxValue: number;

  @Column()
  mode: string;

  @Column()
  status: string;

  @Column()
  paymentStatus: number;

  @Column()
  paymentMethod: number;

  @Column()
  @IsString()
  paymentIntent: string;

  @Column()
  @IsString()
  payerId: string;

  @Column()
  @IsString()
  receiptUrl: string;

  @Column()
  @IsString()
  transactionId: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId', referencedColumnName: 'id' })
  order: Order;

  @ManyToOne(() => OrderProduct)
  @JoinColumn({ name: 'orderId', referencedColumnName: 'orderId' })
  orderproduct: OrderProduct;

  @ManyToOne(() => PaymentStatus)
  @JoinColumn({ name: 'paymentStatus', referencedColumnName: 'id' })
  paymentstatus: PaymentStatus;

  @ManyToOne(() => PaymentMethod)
  @JoinColumn({ name: 'paymentMethod', referencedColumnName: 'id' })
  paymentmethod: PaymentMethod;

  @ManyToOne(() => PromoCode)
  @JoinColumn({ name: 'couponId', referencedColumnName: 'id' })
  promocode: PromoCode;
}
