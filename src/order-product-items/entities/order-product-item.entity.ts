import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Farm } from 'src/farms/entities/farm.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { StallionPromotion } from 'src/stallion-promotions/entities/stallion-promotion.entity';
import { StallionNomination } from 'src/stallion-nominations/entities/stallion-nomination.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { SmpReport } from 'src/smp-report/entities/smp-report.entity';
import { SalesLot } from 'src/sales-lots/entities/sales-lot.entity';
import { BoostProfile } from 'src/boost-profile/entities/boost-profile.entity';
import { NominationRequest } from 'src/nomination-request/entities/nomination-request.entity';


@Entity('tblOrderProductItem')
export class OrderProductItem extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderProductId: number;

  @Column()
  stallionId: number;

  @Column()
  farmId: number;

  @Column()
  mareId: number;

  @Column()
  stallionPromotionId: number;

  @Column()
  stallionNominationId: number;

  @Column()
  lotId: number;

  @Column()
  boostProfileId: number;

  @Column()
  commonList: string;

  @Column()
  sales: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'mareId', referencedColumnName: 'id' })
  horse: Horse;

  @ManyToOne(() => StallionPromotion)
  @JoinColumn({ name: 'stallionPromotionId', referencedColumnName: 'id' })
  stallionPromotion: StallionPromotion;

  // @ManyToOne(() => StallionNomination)
  // @JoinColumn({ name: 'stallionNominationId', referencedColumnName: 'id' })
  // stallionnomination: StallionNomination;

  @ManyToOne(() => OrderProduct)
  @JoinColumn({ name: 'orderProductId', referencedColumnName: 'id' })
  orderproduct: OrderProduct;

  @OneToMany(() => SmpReport, (smpreports) => smpreports.orderproductitem)
  smpreport: SmpReport[];

  @ManyToOne(() => SalesLot)
  @JoinColumn({ name: 'lotId', referencedColumnName: 'Id' })
  saleslot: SalesLot;

  @ManyToOne(() => BoostProfile)
  @JoinColumn({ name: 'boostProfileId', referencedColumnName: 'id' })
  boostprofile: BoostProfile;

  @ManyToOne(() => NominationRequest)
  @JoinColumn({ name: 'stallionNominationId', referencedColumnName: 'id' })
  nominationrequest: NominationRequest;

}
