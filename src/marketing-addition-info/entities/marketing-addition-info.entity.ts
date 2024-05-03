import { MarketingAdditionInfoMedia } from 'src/marketing-addition-info-media/entities/marketing-addition-info-media.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Orientation } from '../carousal-orientation.enum';

@Entity('tblMarketingPageAdditionInfo')
export class MarketingAdditonInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  marketingPageAdditionInfoUuid: string;

  @Column({ nullable: true })
  marketingPageId: number;

  @Column({ nullable: true })
  marketingPageSectionId: number;

  @Column()
  marketingPageAdditionInfoTitle: string;

  @Column()
  marketingPageAdditionInfoName: string;

  @Column()
  marketingPageAdditionInfoDescription: string;

  @Column()
  marketingPageAdditionInfoCompany: string;

  @Column()
  marketingPageAdditionInfoCompanyUrl: string;

  @Column()
  marketingPageAdditionInfoButtonText: string;

  @Column()
  marketingPageAdditionInfoButtonUrl: string;

  @Column('text')
  marketingPageAdditionInfoOrientation: Orientation;

  @Column()
  marketingPageAdditionInfoPosition: number;

  @Column({ default: false, nullable: false })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToOne(() => MarketingAdditionInfoMedia, (media) => media.additionMedia)
  aditnMedia: MarketingAdditionInfoMedia;

  @OneToOne(() => Product, (product) => product.marketingAdditonInfo)
  product: Product;
}
