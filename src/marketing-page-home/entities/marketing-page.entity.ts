import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblMarketingPage')
export class MarketingPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  marketingPageUuid: string;

  @Column()
  marketingPageName: string;

  @Column()
  pagePrefix: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;
}
