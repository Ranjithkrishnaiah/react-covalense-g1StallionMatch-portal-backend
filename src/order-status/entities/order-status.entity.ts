import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { OrderReport } from 'src/order-report/entities/order-report.entity';

@Entity('tblOrderStatus')
export class OrderStatus extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column()
  orderStatusCode: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @OneToMany(() => OrderReport, (orderReport) => orderReport.orderStatus)
  orderReport: OrderReport;
}
