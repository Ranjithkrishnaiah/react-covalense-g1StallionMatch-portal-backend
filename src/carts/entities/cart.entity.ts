import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { Currency } from 'src/currencies/entities/currency.entity';
import { Member } from 'src/members/entities/member.entity';
import { CartProduct } from 'src/cart-product/entities/cart-product.entity';

@Entity('tblCart')
export class Cart extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  cartSessionId: string;

  @Column({ nullable: true })
  memberId: number;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @Column({ nullable: true })
  abandonedCartEmailTrigger: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId', referencedColumnName: 'id' })
  member: Member;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;

  @OneToMany(() => CartProduct, (cartProduct) => cartProduct.cart)
  cartProduct: CartProduct[];
}
