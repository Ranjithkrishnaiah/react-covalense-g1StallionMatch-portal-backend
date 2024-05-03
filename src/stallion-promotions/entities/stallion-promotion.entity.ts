import {
  Column,
  CreateDateColumn,
  Entity,
  Unique,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  Generated,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('tblStallionPromotion')
@Unique(['stallionId'])
export class StallionPromotion extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  promotionUuid: string;

  @Column()
  stallionId: number;

  @CreateDateColumn()
  startDate: Date;

  @CreateDateColumn()
  endDate: Date;

  @CreateDateColumn()
  expiryDate: Date;

  @Column({ default: false })
  isAutoRenew: boolean;

  @Column({ default: false })
  isAdminPromoted: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @Column({ default: 1 })
  promotedCount: number;

  @Column({ default: 0 })
  stopPromotionCount: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;

  @OneToMany(
    () => OrderProductItem,
    (orderproductitem) => orderproductitem.stallionPromotion,
  )
  orderproductitem: OrderProductItem[];
}
