import { Currency } from 'src/currencies/entities/currency.entity';
import { Product } from 'src/products/entities/product.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('tblNominationPricing')
export class NomPricing extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currencyId: number;

  @Column()
  productId: number;

  @Column()
  tier1: number;

  @Column()
  tier2: number;

 @Column()
  tier3: number;

  @Column()
  isActive: boolean;

  @Column()
  studFeeRange: string;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;

}
