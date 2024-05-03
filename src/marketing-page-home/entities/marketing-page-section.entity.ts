import { MarketingMedia } from 'src/marketing-media/entities/marketing-media.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MarketingPage } from './marketing-page.entity';

@Entity('tblMarketingPageSection')
export class MarketingPageSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  marketingPageSectionUuid: string;

  @Column()
  marketingPageId: number;

  @Column()
  marketingPageSectionId: string;

  @Column()
  marketingPageSectionName: string;

  @Column()
  marketingPageSectionType: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToOne(
    () => MarketingMedia,
    (mrktmedia) => mrktmedia.marketingSectionMedia,
  )
  aditnMedia: MarketingMedia;

  @ManyToOne(() => MarketingPage)
  @JoinColumn({ name: 'marketingPageId', referencedColumnName: 'id' })
  marketingPage: MarketingPage;
}
