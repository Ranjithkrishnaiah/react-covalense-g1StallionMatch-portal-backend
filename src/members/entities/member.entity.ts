import {
  Column,
  AfterLoad,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  Generated,
} from 'typeorm';
import { Status } from '../../statuses/entities/status.entity';
import * as bcrypt from 'bcryptjs';
import { EntityHelper } from 'src/utils/entity-helper';
import { AuthProvidersEnum } from 'src/auth/auth-providers.enum';
import { MemberAddress } from 'src/member-address/entities/member-address.entity';
import { FarmLocation } from 'src/farm-locations/entities/farm-location.entity';
import { Exclude } from 'class-transformer';
import { FavouriteStallion } from 'src/favourite-stallions/entities/favourite-stallion.entity';
import { FavouriteFarm } from 'src/favourite-farms/entities/favourite-farm.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { MemberInvitation } from 'src/member-invitations/entities/member-invitation.entity';
import { MemberProfileImage } from 'src/member-profile-image/entities/member-profile-image.entity';
import { SearchStallionMatch } from 'src/search-stallion-match/entities/search-stallion-match.entity';
import { PreferedNotification } from 'src/prefered-notifications/entities/prefered-notification.entity';
import { SmpReport } from 'src/smp-report/entities/smp-report.entity';

@Entity('tblMember')
export class Member extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  memberuuid: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  public previousPassword: string;

  @AfterLoad()
  public loadPreviousPassword(): void {
    this.previousPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword() {
    if (this.previousPassword !== this.password && this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @Column({ default: AuthProvidersEnum.email })
  provider: string;

  @Index()
  @Column({ nullable: true })
  socialId: string | null;

  @Column({ nullable: false })
  fullName: string;

  @Column({ nullable: true })
  isVerified: boolean;

  @Column({ nullable: false })
  roleId: number;

  @ManyToOne(() => Status, {
    eager: true,
  })
  status?: Status;

  @Column({ nullable: true })
  @Index()
  hash: string | null;

  @Column({ nullable: true })
  @Exclude()
  hashedRefreshToken: string;

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn()
  modifiedOn: Date;

  @DeleteDateColumn()
  deletedOn: Date;

  @Column({ nullable: true, type: 'datetime2' })
  lastActive: Date;

  @Column({ nullable: true })
  isArchived: boolean;
  
  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true, type: 'datetime2' })
  suspendedOn: Date;

  @OneToMany(() => FarmLocation, (farmlocation) => farmlocation.createdby)
  farmlocationscreatedby: FarmLocation[];

  @OneToMany(() => FarmLocation, (farmlocation) => farmlocation.modifiedby)
  farmlocationsmodifiedby: FarmLocation[];

  @OneToMany(() => MemberAddress, (memberaddress) => memberaddress.member)
  memberaddress: MemberAddress[];

  @OneToMany(
    () => FavouriteStallion,
    (favouritestallions) => favouritestallions.member,
  )
  favouritestallions: FavouriteStallion[];

  @OneToMany(() => FavouriteFarm, (favouritefarms) => favouritefarms.member)
  favouritefarms: FavouriteFarm[];

  @OneToMany(() => Cart, (cart) => cart.member)
  carts: Cart[];

  @OneToMany(() => MemberFarm, (memberfarm) => memberfarm.member)
  memberfarms: MemberFarm[];

  @OneToMany(
    () => MemberInvitation,
    (memberinvitation) => memberinvitation.member,
  )
  memberinvitations: MemberInvitation[];

  @OneToMany(
    () => MemberProfileImage,
    (memberprofileimage) => memberprofileimage.member,
  )
  memberprofileimages: MemberProfileImage[];

  @OneToMany(
    () => SearchStallionMatch,
    (searchstallionmatch) => searchstallionmatch.member,
  )
  searchstallionmatchs: SearchStallionMatch[];

  @OneToMany(
    () => PreferedNotification,
    (preferedNotification) => preferedNotification.member,
  )
  preferedNotifications: PreferedNotification[];

  @OneToMany(
    () => SmpReport,
    (smpreportcreatedby) => smpreportcreatedby.createdby,
  )
  smpreportcreatedby: SmpReport[];

  @OneToMany(
    () => SmpReport,
    (smpreportmodifiedby) => smpreportmodifiedby.modifiedby,
  )
  smpreportmodifiedby: SmpReport[];
}
