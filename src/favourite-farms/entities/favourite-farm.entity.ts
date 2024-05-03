import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Farm } from 'src/farms/entities/farm.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('tblFavouriteFarm')
export class FavouriteFarm extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  farmId: number;

  /*this is nothing but memberId*/
  @Column({ nullable: true })
  memberId: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  createdBy: number;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId', referencedColumnName: 'id' })
  member: Member;
}
