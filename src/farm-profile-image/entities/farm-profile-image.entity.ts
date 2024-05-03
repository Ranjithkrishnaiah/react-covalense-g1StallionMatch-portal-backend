import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Media } from 'src/media/entities/media.entity';
import { Farm } from 'src/farms/entities/farm.entity';

@Entity('tblFarmProfileImage')
export class FarmProfileImage extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  farmId: number;

  @Column({ nullable: true })
  mediaId: number;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;

  @ManyToOne(() => Media)
  @JoinColumn({ name: 'mediaId', referencedColumnName: 'id' })
  media: Media;
}
