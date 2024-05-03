import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';

@Entity('tblSalesStatus')
export class SalesStatus extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  status: number;

  @Column({ nullable: true })
  createdBy: number;

  // @Column({ nullable: true })
  // modifiedBy: number;

  // @UpdateDateColumn()
  // modifiedOn: Date;
}
