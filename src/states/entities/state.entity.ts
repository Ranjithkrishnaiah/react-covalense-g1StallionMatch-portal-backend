import { Country } from '../../country/entity/country.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { FarmLocation } from '../../farm-locations/entities/farm-location.entity';

@Entity('tblState')
export class State extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  stateName: string;

  @Column({ nullable: true })
  stateCode: string;

  @Column({ default: true })
  isDisplay: boolean;

  @Column({ nullable: true })
  countryId: number;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  country: Country;

  @OneToMany(() => FarmLocation, (farmlocation) => farmlocation.state)
  farmlocations: FarmLocation[];
}
