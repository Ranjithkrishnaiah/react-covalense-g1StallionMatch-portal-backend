import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';

@Entity('tblSocialShareType')
export class SocialShareType extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  socialShareType: string;

  @CreateDateColumn()
  createdOn: Date;
}
