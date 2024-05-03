import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { FarmMediaInfo } from 'src/farm-media-info/entities/farm-media-info.entity';
import { Media } from 'src/media/entities/media.entity';

@Entity('tblFarmMediaFile')
export class FarmMediaFile extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  mediaInfoId: number;

  @Column({ nullable: true })
  mediaId: number;

  @ManyToOne(() => FarmMediaInfo)
  @JoinColumn({ name: 'mediaInfoId', referencedColumnName: 'id' })
  farmmediainfo: FarmMediaInfo;

  @ManyToOne(() => Media)
  @JoinColumn({ name: 'mediaId', referencedColumnName: 'id' })
  media: Media;
}
