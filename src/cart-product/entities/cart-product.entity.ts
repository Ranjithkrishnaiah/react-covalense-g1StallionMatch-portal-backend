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
import { Cart } from 'src/carts/entities/cart.entity';
import { Product } from 'src/products/entities/product.entity';
import { CartProductItem } from 'src/cart-product-items/entities/cart-product-item.entity';
import { Currency } from 'src/currencies/entities/currency.entity';

@Entity('tblCartProduct')
export class CartProduct extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cartId: number;

  @Column()
  productId: number;

  @Column()
  price: number;

  @Column()
  quantity: number;
// Added to edit stallions in edit cart
  @Column({ nullable: true })
  CurrencyId: number;

  @Column({ nullable: true })
  selectedpriceRange: string;

  @Column({ default: false })
  isIncludePrivateFee: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Cart)
  @JoinColumn({ name: 'cartId', referencedColumnName: 'id' })
  cart: Cart;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product;

  @OneToMany(
    () => CartProductItem,
    (cartProductItem) => cartProductItem.cartproduct,
  )
  cartProductItem: CartProductItem[];

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'CurrencyId', referencedColumnName: 'id' })
  reportCurrency: Currency;
}
