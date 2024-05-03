import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { StallionProfileImage } from 'src/stallion-profile-image/entities/stallion-profile-image.entity';
import { StallionGalleryImage } from 'src/stallion-gallery-images/entities/stallion-gallery-image.entity';
import { StallionTestimonialMedia } from 'src/stallion-testimonial-media/entities/stallion-testimonial-media.entity';
import { FarmProfileImage } from 'src/farm-profile-image/entities/farm-profile-image.entity';
import { FarmGalleryImage } from 'src/farm-gallery-images/entities/farm-gallery-image.entity';
import { FarmMediaFile } from 'src/farm-media-files/entities/farm-media-file.entity';
import { MemberProfileImage } from 'src/member-profile-image/entities/member-profile-image.entity';
import { MarketingAdditionInfoMedia } from 'src/marketing-addition-info-media/entities/marketing-addition-info-media.entity';
import { MarketingMedia } from 'src/marketing-media/entities/marketing-media.entity';

@Entity('tblMedia')
@Unique(['mediauuid'])
export class Media extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  fileName: string;

  @Column({ nullable: true })
  mediauuid: string;

  @Column({ nullable: true })
  mediaLocation: string;

  @Column({ nullable: true })
  mediaUrl: string;

  @Column({ nullable: true })
  mediaThumbnailUrl: string;

  @Column({ nullable: true })
  mediaShortenUrl: string;

  @Column({ nullable: true })
  mediaFileType: string;

  @Column({ nullable: true })
  mediaFileSize: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: false })
  markForDeletion: boolean;

  @Column({ nullable: true })
  markForDeletionRequestBy: number;

  @Column({ nullable: true, type: 'datetime2' })
  markForDeletionRequestDate: Date;

  @Column({ nullable: true })
  approvedBy: number;

  @Column({ nullable: true, type: 'datetime2' })
  approvedOn: Date;

  @OneToMany(
    () => StallionProfileImage,
    (stallionprofileimage) => stallionprofileimage.media,
  )
  media: StallionProfileImage[];

  @OneToMany(
    () => StallionGalleryImage,
    (stalliongalleryimage) => stalliongalleryimage.media,
  )
  stalliongalleryimagemedia: StallionGalleryImage[];

  @OneToMany(
    () => StallionTestimonialMedia,
    (stalliontestimonialmedia) => stalliontestimonialmedia.media,
  )
  stalliontestimonialmedia: StallionTestimonialMedia[];

  @OneToMany(
    () => FarmProfileImage,
    (farmprofileimage) => farmprofileimage.media,
  )
  farmprofileimagemedia: FarmProfileImage[];

  @OneToMany(
    () => FarmGalleryImage,
    (farmgalleryimage) => farmgalleryimage.media,
  )
  farmgalleryimagemedia: FarmGalleryImage[];

  @OneToMany(() => FarmMediaFile, (farmmediafile) => farmmediafile.media)
  farmmediainfofilemedia: FarmMediaFile[];

  @OneToMany(
    () => MemberProfileImage,
    (memberprofileimage) => memberprofileimage.media,
  )
  memberprofileimage: MemberProfileImage[];

  @OneToOne(() => MarketingAdditionInfoMedia)
  @JoinColumn({ name: 'id', referencedColumnName: 'mediaId' })
  marketingAdditionMedia: MarketingAdditionInfoMedia;

  @OneToOne(() => MarketingMedia)
  @JoinColumn({ name: 'id', referencedColumnName: 'mediaId' })
  marketMedia: MarketingMedia;
}
