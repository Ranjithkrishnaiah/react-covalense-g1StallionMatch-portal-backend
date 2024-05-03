import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('tblCurrencyRate')
@Unique(['currencyCode'])
export class CurrencyRate extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currencyCode: string;

  @Column()
  rate: number;

  @CreateDateColumn({ select: false })
  createdOn: Date;
}
