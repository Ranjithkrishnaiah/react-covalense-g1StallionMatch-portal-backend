import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Country } from '../../country/entity/country.entity';
import { Colour } from 'src/colours/entities/colour.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { HorseType } from 'src/horse-types/entities/horse-type.entity';
import { Currency } from 'src/currencies/entities/currency.entity';
import { MemberMare } from 'src/member-mares/entities/member-mare.entity';
import { NominationRequest } from 'src/nomination-request/entities/nomination-request.entity';
import { FavouriteBroodmareSire } from 'src/favourite-broodmare-sires/entities/favourite-broodmare-sire.entity';
import { SearchStallionMatch } from 'src/search-stallion-match/entities/search-stallion-match.entity';
import { SmpReport } from 'src/smp-report/entities/smp-report.entity';
import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';

@Entity('tblHorse')
export class Horse extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  horseUuid: string;

  @Column({ type: 'varchar' })
  horseName: string;

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true })
  sireId: number;

  @Column({ nullable: true })
  damId: number;

  @Column({ nullable: true })
  colourId: number;

  @Column({ nullable: true })
  horseTypeId: number;

  @Column({ type: 'smallint', nullable: true })
  yob: number;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  //TODO: Enums equalent in sql, need to findout
  @Column({ type: 'char', nullable: true })
  sex: string;

  @Column({ default: false })
  gelding: boolean;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ nullable: true })
  totalPrizeMoneyEarned: number;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  verifiedBy: number;

  @Column({ nullable: true })
  verifiedOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @Column({ default: false })
  isArchived: boolean;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  nationality: Country;

  @ManyToOne(() => Colour)
  @JoinColumn({ name: 'colourId', referencedColumnName: 'id' })
  colour: Colour;

  @OneToMany(() => Stallion, (stallion) => stallion.horse)
  stallions: Stallion[];

  @ManyToOne(() => HorseType)
  @JoinColumn({ name: 'horseTypeId', referencedColumnName: 'id' })
  horsetype: HorseType;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;

  @OneToMany(() => MemberMare, (membermares) => membermares.horse)
  membermares: MemberMare[];

  @OneToOne(
    () => NominationRequest,
    (nominationRequest) => nominationRequest.mare,
  )
  mare: NominationRequest;

  @OneToMany(
    () => FavouriteBroodmareSire,
    (favouritebroodmaresire) => favouritebroodmaresire.horse,
  )
  favouritebroodmaresire: FavouriteBroodmareSire[];

  @OneToMany(
    () => SearchStallionMatch,
    (searchstallionmatch) => searchstallionmatch.mare,
  )
  searchstallionmatches: SearchStallionMatch[];

  @OneToMany(() => SmpReport, (smpreports) => smpreports.mare)
  smpreport: SmpReport[];

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'sireId', referencedColumnName: 'id' })
  sire: Horse;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'damId', referencedColumnName: 'id' })
  dam: Horse;

  @OneToMany(
    () => OrderProductItem,
    (orderProductItem) => orderProductItem.horse,
  )
  orderProductItem: OrderProductItem[];
}
