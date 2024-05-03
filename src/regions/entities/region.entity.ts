import { Country } from '../../country/entity/country.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';

@Entity('tblRegion')
export class Region extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  regionName: string;

  @OneToMany(() => Country, (country) => country.region)
  countries: Country[];
}
