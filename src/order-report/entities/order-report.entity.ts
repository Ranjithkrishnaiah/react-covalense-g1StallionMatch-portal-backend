import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { OrderStatus } from 'src/order-status/entities/order-status.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';

@Entity('tblOrderReport')
export class OrderReport extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderProductId: number;

  @Column()
  orderStatusId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => OrderStatus)
  @JoinColumn({ name: 'orderStatusId', referencedColumnName: 'id' })
  orderStatus: OrderStatus;

  @ManyToOne(() => OrderProduct)
  @JoinColumn({ name: 'orderProductId', referencedColumnName: 'id' })
  orderProduct: OrderProduct;

}

