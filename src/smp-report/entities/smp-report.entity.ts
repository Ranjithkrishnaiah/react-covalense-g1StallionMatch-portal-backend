import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';
import { Currency } from 'src/currencies/entities/currency.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('tblSMPReport')
export class SmpReport extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  orderProductItemId: number;

  @Column({ nullable: true })
  stallionId: number;

  @Column({ nullable: true })
  mareId: number;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ nullable: true })
  minFee: number;

  @Column({ nullable: true })
  maxFee: number;

  @Column({ nullable: true })
  isApproved: boolean;

  @Column({ nullable: true })
  isCancelled: boolean;

  @Column({ nullable: true })
  isReportGenerated: boolean;

  @Column({ nullable: true })
  isSent: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn({ nullable: true, type: 'datetime2' })
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @Column({ nullable: true, type: 'datetime2' })
  modifiedOn: Date;

  @ManyToOne(() => OrderProductItem)
  @JoinColumn({ name: 'orderProductItemId', referencedColumnName: 'id' })
  orderproductitem: OrderProductItem;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'mareId', referencedColumnName: 'id' })
  mare: Horse;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  createdby: Member;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'modifiedBy', referencedColumnName: 'id' })
  modifiedby: Member;
}
