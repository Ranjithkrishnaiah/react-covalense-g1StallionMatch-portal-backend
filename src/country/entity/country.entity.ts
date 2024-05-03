import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { State } from '../../states/entities/state.entity';
import { FarmLocation } from '../../farm-locations/entities/farm-location.entity';
import { Horse } from '../../horses/entities/horse.entity';
import { Region } from 'src/regions/entities/region.entity';
import { Currency } from 'src/currencies/entities/currency.entity';
import { StallionRequest } from 'src/stallion-requests/entities/stallion-request.entity';
import { RegisterInterest } from 'src/register-interests/entity/register-interest.entity';
import { StallionLocation } from 'src/stallion-locations/entities/stallion-location.entity';

@Entity('tblCountry')
@Unique(['countryName'])
export class Country extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  countryName: string;

  @Column()
  countryCode: string;

  @Column()
  countryA2Code: string;

  @Column({ nullable: true })
  regionId: number;

  @Column({ nullable: true })
  preferredCurrencyId: number;

  @Column({ default: true })
  isDisplay: boolean;

  @CreateDateColumn({ select: false })
  createdOn: Date;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @OneToMany(() => State, (state) => state.country)
  states: State[];

  @OneToMany(() => FarmLocation, (farmlocation) => farmlocation.country)
  farmlocations: FarmLocation[];

  @OneToMany(() => Horse, (horse) => horse.nationality)
  horses: Horse[];

  @ManyToOne(() => Region)
  @JoinColumn({ name: 'regionId', referencedColumnName: 'id' })
  region: Region;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'preferredCurrencyId', referencedColumnName: 'id' })
  currency: Currency;

  @OneToMany(
    () => StallionRequest,
    (stallionrequest) => stallionrequest.nationality,
  )
  stallionrequests: StallionRequest[];

  @OneToMany(
    () => StallionLocation,
    (stallionLocation) => stallionLocation.country,
  )
  stallionLocation: StallionLocation[];

  @OneToMany(
    () => RegisterInterest,
    (registerinterest) => registerinterest.countryId,
  )
  registerinterest: RegisterInterest[];
}
