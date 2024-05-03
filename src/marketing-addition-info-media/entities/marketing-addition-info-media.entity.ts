import { Media } from 'src/media/entities/media.entity';
import { MarketingAdditonInfo } from 'src/marketing-addition-info/entities/marketing-addition-info.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblMarketingPageAdditionInfoMedia')
export class MarketingAdditionInfoMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  marketingPageAdditionInfoId: number;

  @Column()
  mediaId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToOne(() => MarketingAdditonInfo)
  @JoinColumn({
    name: 'marketingPageAdditionInfoId',
    referencedColumnName: 'id',
  })
  additionMedia: MarketingAdditonInfo;

  @OneToOne(() => Media, (media) => media.marketingAdditionMedia)
  media: Media;
}
