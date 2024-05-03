import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Country } from '../../country/entity/country.entity';
import { SalesLot } from 'src/sales-lots/entities/sales-lot.entity';
import { Salestype } from 'src/sales/entities/sales-type.entity';
import { Horse } from 'src/horses/entities/horse.entity';

@Entity('tblLotInfoTemp')
export class SalesLotInfoTemp extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  salesLotInfoUuid: string;

  @Column({ type: 'int' })
  horseId: number;

  @Column({ type: 'int' })
  salesLotId: number;

  @Column({ type: 'varchar' })
  horseName: string;

  @Column({ type: 'varchar' })
  horseYob: string;

  @Column({ type: 'varchar' })
  horseFoaledDate: string;

  @Column({ type: 'varchar' })
  horseCob: string;

  @Column({ type: 'int' })
  horseCobId: number;

  @Column({ type: 'varchar' })
  horseColour: string;

  @Column({ type: 'varchar' })
  horseColourCode: string;

  @Column({ type: 'int' })
  horseColourId: number;

  @Column({ type: 'int' })
  sireId: number;

  @Column({ type: 'varchar' })
  sireName: string;

  @Column({ type: 'varchar' })
  sireYob: string;

  @Column({ type: 'varchar' })
  sireCob: string;

  @Column({ type: 'varchar' })
  sireColour: string;

  @Column({ type: 'int' })
  damId: number;

  @Column({ type: 'varchar' })
  damName: string;

  @Column({ type: 'varchar' })
  damYob: string;

  @Column({ type: 'varchar' })
  damCob: string;

  @Column({ type: 'varchar' })
  damColour: string;

  @Column({ type: 'int' })
  sireSireId: number;

  @Column({ type: 'varchar', nullable: true })
  sireSireName: string;

  @Column({ type: 'varchar' })
  sireSireYob: string;

  @Column({ type: 'varchar' })
  sireSireCob: string;

  @Column({ type: 'varchar' })
  sireSireColour: string;

  @Column({ type: 'int' })
  damSireId: number;

  @Column({ type: 'varchar' })
  damSireName: string;

  @Column({ type: 'varchar' })
  damSireYob: string;

  @Column({ type: 'varchar' })
  damSireCob: string;

  @Column({ type: 'varchar' })
  damSireColour: string;

  @Column({ type: 'varchar' })
  damMatchType: string;

  @Column({ type: 'varchar' })
  sireMatchType: string;

  @Column()
  isVerifiedSire: boolean;

  @Column()
  isVerifiedDam: boolean;

  @CreateDateColumn()
  createdOn: Date;

  @OneToOne(() => SalesLot)
  @JoinColumn({ name: 'salesLotId', referencedColumnName: 'Id' })
  salesLot: SalesLot;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'sireId', referencedColumnName: 'id' })
  sire: Horse;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'damId', referencedColumnName: 'id' })
  dam: Horse;
}
