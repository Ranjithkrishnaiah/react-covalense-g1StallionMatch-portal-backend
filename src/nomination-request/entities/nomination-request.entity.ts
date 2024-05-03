import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  Relation,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Farm } from 'src/farms/entities/farm.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { Currency } from 'src/currencies/entities/currency.entity';

@Entity('tblNominationRequest')
export class NominationRequest extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nrUuid: string;

  @Column()
  stallionId: number;

  @Column()
  farmId: number;

  @Column()
  mareId: number;

  @Column()
  currencyId: number;

  @Column()
  mareName: string;

  @Column()
  offerPrice: number;

  @Column()
  counterOfferPrice: number;

  @Column()
  cob: number;

  @Column()
  yob: number;

  @Column({ default: false })
  isAccepted: Boolean;

  @Column({ default: false })
  isDeclined: Boolean;

  @Column({ default: false })
  isCounterOffer: Boolean;

  @Column({ default: false })
  isClosed: Boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date | null;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;

  @OneToOne(() => Stallion, (stallion) => stallion.stallion)
  @JoinColumn()
  stallion: Relation<Stallion>;

  @OneToOne(() => Farm, (farm) => farm.farm)
  @JoinColumn()
  farm: Relation<Farm>;

  @OneToOne(() => Horse, (horse) => horse.mare)
  @JoinColumn()
  mare: Relation<Horse>;
}
