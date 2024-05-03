import {
  Column,
  CreateDateColumn,
  Entity,
  Unique,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';

@Entity('tblStallionNomination')
@Unique(['stallionId'])
export class StallionNomination extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  stallionId: number;

  @Column({ nullable: true })
  noOfNominations: number;

  @CreateDateColumn()
  startDate: Date;

  @CreateDateColumn()
  endDate: Date;

  @Column({ nullable: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @OneToMany(
    () => OrderProductItem,
    (orderproductitem) => orderproductitem.stallionPromotion,
  )
  orderproductitem: OrderProductItem[];
}
