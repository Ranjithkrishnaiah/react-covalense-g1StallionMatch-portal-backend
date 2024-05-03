import { Horse } from 'src/horses/entities/horse.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblHorseBreed')
export class HorseType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  horseTypeName: string;

  @Column({ default: false })
  isEligible: boolean;

  @CreateDateColumn({ select: false })
  createdOn: Date;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @OneToMany(() => Horse, (horse) => horse.horsetype)
  horses: Horse[];
}
