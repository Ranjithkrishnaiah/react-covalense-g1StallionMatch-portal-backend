import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Product } from 'src/products/entities/product.entity';
import { Currency } from 'src/currencies/entities/currency.entity';

@Entity('tblPricing')
export class Pricing extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currencyId: number;

  @Column()
  productId: number;

  @Column()
  price: number;

  @Column()
  isActive: boolean;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;
}
