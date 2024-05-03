import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';

@Entity('tblSetting')
@Unique(['smSettingKey'])
export class Setting extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  smSettingKey: string;

  @Column({ nullable: true })
  smSettingValue: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @CreateDateColumn()
  modifiedOn: Date;
}
