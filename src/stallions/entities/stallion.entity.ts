import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Farm } from 'src/farms/entities/farm.entity';
import { StallionServiceFee } from 'src/stallion-service-fees/entities/stallion-service-fee.entity';
import { FavouriteStallion } from 'src/favourite-stallions/entities/favourite-stallion.entity';
import { StallionLocation } from 'src/stallion-locations/entities/stallion-location.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { StallionTestimonial } from 'src/stallion-testimonials/entities/stallion-testimonial.entity';
import { StallionShortlist } from 'src/stallion-shortlist/entities/stallion-shortlist.entity';
import { StallionNomination } from 'src/stallion-nominations/entities/stallion-nomination.entity';
import { StallionPromotion } from 'src/stallion-promotions/entities/stallion-promotion.entity';
import { StallionReason } from 'src/stallion-reasons/entities/stallion-reasons.entity';
import { StallionProfileImage } from 'src/stallion-profile-image/entities/stallion-profile-image.entity';
import { StallionGalleryImage } from 'src/stallion-gallery-images/entities/stallion-gallery-image.entity';
import { MemberFarmStallion } from 'src/member-farm-stallions/entities/member-farm-stallion.entity';
import { NominationRequest } from 'src/nomination-request/entities/nomination-request.entity';
import { SearchStallionMatch } from 'src/search-stallion-match/entities/search-stallion-match.entity';
import { AuditStallion } from './audit-stallion.entity';
import { SmpReport } from 'src/smp-report/entities/smp-report.entity';

@Entity('tblStallion')
export class Stallion extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  stallionUuid: string;

  @Column({ nullable: true })
  horseId: number;

  @Column({ nullable: true })
  farmId: number;

  @Column()
  url: string;

  @Column()
  yearToStud: number;

  @Column()
  yearToRetired: number;

  @Column()
  height: string;

  @Column()
  overview: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isRemoved: boolean | null;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  verifiedBy: number;

  @Column({ nullable: true })
  verifiedOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @Column({ nullable: true })
  reasonId: number;

  /* Add Relations to farm and horse*/
  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'horseId', referencedColumnName: 'id' })
  horse: Horse;

  @OneToMany(
    () => StallionServiceFee,
    (stallionservicefee) => stallionservicefee.stallion,
  )
  stallionservicefee: StallionServiceFee[];

  @OneToMany(
    () => FavouriteStallion,
    (favouritestallions) => favouritestallions.stallion,
  )
  favouritestallions: FavouriteStallion[];

  @OneToOne(
    () => StallionLocation,
    (stallionlocation) => stallionlocation.stallion,
  )
  stallionlocation: StallionLocation;

  @OneToMany(
    () => StallionTestimonial,
    (stalliontestimonials) => stalliontestimonials.stallion,
  )
  stalliontestimonials: StallionTestimonial[];

  @OneToMany(
    () => StallionShortlist,
    (stallionshortlist) => stallionshortlist.stallion,
  )
  stallionshortlists: StallionShortlist[];

  @OneToMany(
    () => StallionNomination,
    (stallionnomination) => stallionnomination.stallion,
  )
  stallionnomination: StallionNomination[];

  @OneToMany(
    () => StallionPromotion,
    (stallionpromotions) => stallionpromotions.stallion,
  )
  stallionpromotion: StallionPromotion[];

  @ManyToOne(() => StallionReason)
  @JoinColumn({ name: 'reasonId', referencedColumnName: 'id' })
  stallionreason: StallionReason;

  @OneToMany(
    () => StallionProfileImage,
    (stallionprofileimage) => stallionprofileimage.stallion,
  )
  stallionprofileimage: StallionProfileImage[];

  @OneToMany(
    () => StallionGalleryImage,
    (stalliongalleryimage) => stalliongalleryimage.stallion,
  )
  stalliongalleryimage: StallionGalleryImage[];

  @OneToMany(
    () => MemberFarmStallion,
    (memberfarmstallion) => memberfarmstallion.stallion,
  )
  memberfarmstallion: MemberFarmStallion[];

  @OneToOne(
    () => NominationRequest,
    (nominationRequest) => nominationRequest.stallion,
  )
  stallion: NominationRequest;

  @OneToMany(
    () => SearchStallionMatch,
    (searchstallionmatch) => searchstallionmatch.stallion,
  )
  searchstallionmatchs: SearchStallionMatch[];

  @OneToMany(() => AuditStallion, (auditStallion) => auditStallion.stallion)
  auditStallion: AuditStallion[];

  @OneToMany(() => SmpReport, (smpreports) => smpreports.stallion)
  smpreport: SmpReport[];
}
