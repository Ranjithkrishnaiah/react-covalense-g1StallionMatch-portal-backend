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
import { Country } from 'src/country/entity/country.entity';
import { Currency } from 'src/currencies/entities/currency.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';
import { IsEmail, IsUUID, IsString } from 'class-validator';

@Entity('tblOrder')
export class Order extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currencyId: number;

  @Column()
  @IsString()
  sessionId: string;

  @Column()
  fullName: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  total: number;

  @Column()
  postalCode: string;

  @Column()
  countryId: number;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  memberId: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ default: 1 })
  orderStatusId: number;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  cart: Currency;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  country: Country;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  orderProduct: OrderProduct[];
}
