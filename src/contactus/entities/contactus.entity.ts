import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
@Entity('tblContactus')
export class Contactus extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  interestedIn: string;

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactDescription: string;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  countryName?: string;

  @Column({ nullable: true })
  userAgent: string;
}
