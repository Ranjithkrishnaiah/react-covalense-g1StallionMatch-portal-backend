import { MarketingPageSection } from 'src/marketing-page-home/entities/marketing-page-section.entity';
import { Media } from 'src/media/entities/media.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblMarketingMedia')
export class MarketingMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  marketingPageId: number;

  @Column({ nullable: true })
  marketingPageSectionId: number;

  @Column({ nullable: true })
  mediaId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToOne(() => MarketingPageSection)
  @JoinColumn({ name: 'marketingPageSectionId', referencedColumnName: 'id' })
  marketingSectionMedia: MarketingPageSection;

  @OneToOne(() => Media, (media) => media.marketMedia)
  media: Media;
}
