import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { Category } from 'src/categories/entities/category.entity';
import { Currency } from 'src/currencies/entities/currency.entity';
import { CartProduct } from 'src/cart-product/entities/cart-product.entity';
import { MarketingAdditonInfo } from 'src/marketing-addition-info/entities/marketing-addition-info.entity';
import { Pricing } from 'src/pricing/entities/pricing.entity';

@Entity('tblProduct')
export class Product extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  categoryId: number;

  @Column({ nullable: true })
  productName: string;

  @Column({ nullable: true })
  productCode: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ nullable: true })
  marketingPageInfoId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'id' })
  category: Category;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;

  @OneToMany(() => CartProduct, (cartProduct) => cartProduct.cart)
  cartProduct: CartProduct[];

  @OneToOne(() => MarketingAdditonInfo)
  @JoinColumn({ name: 'marketingPageInfoId', referencedColumnName: 'id' })
  marketingAdditonInfo: MarketingAdditonInfo;

  @OneToMany(() => Pricing, (pricing) => pricing.product)
  pricing: Pricing[];
}
