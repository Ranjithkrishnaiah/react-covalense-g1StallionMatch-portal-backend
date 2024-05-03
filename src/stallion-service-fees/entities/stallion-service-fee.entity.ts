import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Currency } from 'src/currencies/entities/currency.entity';

@Entity('tblStallionServiceFee')
export class StallionServiceFee extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  stallionId: number;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ nullable: true })
  fee: number;

  @Column({ nullable: true })
  feeYear: number;

  @Column({ nullable: false, default: false })
  isPrivateFee: boolean;

  /* 1 - SM Internal Update / 2 - Farm Update */
  @Column({ nullable: true, default: 2 })
  feeUpdatedFrom: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;
}
