import { Cart } from 'src/carts/entities/cart.entity';
import { Country } from 'src/country/entity/country.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { Product } from 'src/products/entities/product.entity';
import { NominationRequest } from 'src/nomination-request/entities/nomination-request.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblCurrency')
@Unique(['currencyName', 'currencyCode'])
export class Currency extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currencyName: string;

  @Column()
  currencyCode: string;

  @Column()
  currencySymbol: string;

  @CreateDateColumn({ select: false })
  createdOn: Date;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @OneToMany(() => Country, (country) => country.currency)
  countries: Country[];

  @OneToMany(() => Product, (product) => product.currency)
  products: Product[];

  @OneToMany(() => Cart, (cart) => cart.currency)
  carts: Cart[];

  @OneToMany(() => Horse, (horse) => horse.currency)
  horses: Horse[];

  @OneToMany(() => NominationRequest, (nr) => nr.currency)
  nr: NominationRequest[];
}
