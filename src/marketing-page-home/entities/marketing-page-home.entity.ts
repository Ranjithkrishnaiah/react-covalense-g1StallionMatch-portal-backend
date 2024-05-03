import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MarketingPageSection } from './marketing-page-section.entity';

@Entity('tblMarketingPageData')
export class MarketingPageHomeData {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  marketingPageDataUuid: string;

  @Column({ nullable: true })
  marketingPageId: number;

  @Column({ nullable: true })
  marketingPageSectionId: number;

  @Column()
  marketingPageTitle: string;

  @Column()
  marketingPageDescription: string;

  @Column()
  marketingPageDescription1: string;

  @Column()
  marketingPageDescription2: string;

  @Column()
  marketingPageDescription3: string;

  @Column()
  marketingPagePlaceholder: string;

  @Column()
  marketingPageButtonText: string;

  @Column()
  marketingPageButtonUrl: string;

  @Column()
  marketingPageTarget: string;

  @Column({ default: false, nullable: false })
  isAuthenticated: boolean;

  @Column({ default: false, nullable: false })
  isAnonymous: boolean;

  @Column({ default: false, nullable: false })
  isRegistered: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToOne(() => MarketingPageSection)
  @JoinColumn()
  marketingPageSection: MarketingPageSection;
}
