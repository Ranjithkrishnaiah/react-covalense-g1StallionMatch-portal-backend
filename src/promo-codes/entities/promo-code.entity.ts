import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { Currency } from 'src/currencies/entities/currency.entity';

@Entity('tblPromoCode')
export class PromoCode extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  promoCode: string;

  @Column({ nullable: true })
  discountType: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ nullable: true })
  productids: string;

  @Column({ nullable: true })
  memberId: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  durationType: string;

  @Column({ nullable: true })
  durationNo: number;

  @Column({ nullable: true })
  redemtions: number;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;
}
