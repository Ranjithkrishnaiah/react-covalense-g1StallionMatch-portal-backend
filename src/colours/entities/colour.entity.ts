import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Horse } from '../../horses/entities/horse.entity';

@Entity('tblColour')
@Unique(['colourName'])
export class Colour extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  colourName: string;

  @Column({ nullable: true })
  colourCode: string;

  @Column({ nullable: true })
  colourDominancy: string;

  @Column({ nullable: true })
  colourDominancyId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToMany(() => Horse, (horse) => horse.colour)
  horses: Horse[];
}
