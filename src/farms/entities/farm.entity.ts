import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { FarmLocation } from 'src/farm-locations/entities/farm-location.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { FavouriteFarm } from 'src/favourite-farms/entities/favourite-farm.entity';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { MemberInvitation } from 'src/member-invitations/entities/member-invitation.entity';
import { FarmProfileImage } from 'src/farm-profile-image/entities/farm-profile-image.entity';
import { FarmGalleryImage } from 'src/farm-gallery-images/entities/farm-gallery-image.entity';
import { NominationRequest } from 'src/nomination-request/entities/nomination-request.entity';
import { MareListInfo } from 'src/mare-list-info/entities/mare-list-info.entity';
import { AuditFarm } from './audit-farm.entity';
import { ActivityEntity } from 'src/activity-module/activity.entity';

@Entity('tblFarm')
// @Unique(['farmName'])
export class Farm extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  farmUuid: string;

  @Column({ type: 'varchar' })
  farmName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToMany(() => FarmLocation, (farmlocation) => farmlocation.farm)
  farmlocations: FarmLocation[];

  @OneToMany(() => Stallion, (stallion) => stallion.farm)
  stallions: Stallion[];

  @OneToMany(() => FavouriteFarm, (favouritefarms) => favouritefarms.farm)
  favouritefarms: FavouriteFarm[];

  @OneToMany(() => MemberFarm, (memberfarm) => memberfarm.farm)
  memberfarms: MemberFarm[];

  @OneToMany(
    () => MemberInvitation,
    (memberinvitation) => memberinvitation.farm,
  )
  memberinvitation: MemberInvitation[];

  @OneToMany(
    () => FarmProfileImage,
    (farmprofileimage) => farmprofileimage.farm,
  )
  farmprofileimage: FarmProfileImage[];

  @OneToMany(
    () => FarmGalleryImage,
    (farmgalleryimage) => farmgalleryimage.farm,
  )
  farmgalleryimages: FarmGalleryImage[];

  @OneToOne(
    () => NominationRequest,
    (nominationRequest) => nominationRequest.farm,
  )
  farm: NominationRequest;

  @OneToMany(() => MareListInfo, (marelist) => marelist.farm)
  marelists: MareListInfo[];

  @OneToMany(() => AuditFarm, (auditFarm) => auditFarm.farm)
  auditFarm: AuditFarm[];

  @OneToMany(() => ActivityEntity, (farmActivity) => farmActivity.farm)
  farmActivity: ActivityEntity[];
}
