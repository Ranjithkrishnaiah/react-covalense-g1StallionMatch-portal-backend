import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Farm } from 'src/farms/entities/farm.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { StallionPromotion } from 'src/stallion-promotions/entities/stallion-promotion.entity';
import { CartProduct } from 'src/cart-product/entities/cart-product.entity';
import { NominationRequest } from 'src/nomination-request/entities/nomination-request.entity';
import { SalesLot } from 'src/sales-lots/entities/sales-lot.entity';
import { BoostProfile } from 'src/boost-profile/entities/boost-profile.entity';

@Entity('tblCartProductItem')
export class CartProductItem extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cartProductId: number;

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
  horse: Farm;

  @ManyToOne(() => StallionPromotion)
  @JoinColumn({ name: 'stallionPromotionId', referencedColumnName: 'id' })
  stallionPromotion: StallionPromotion;

  @ManyToOne(() => NominationRequest)
  @JoinColumn({ name: 'stallionNominationId', referencedColumnName: 'id' })
  nominationrequest: NominationRequest;

  @ManyToOne(() => CartProduct)
  @JoinColumn({ name: 'cartProductId', referencedColumnName: 'id' })
  cartproduct: CartProduct;

  @ManyToOne(() => SalesLot)
  @JoinColumn({ name: 'lotId', referencedColumnName: 'Id' })
  saleslot: SalesLot;

  @ManyToOne(() => BoostProfile)
  @JoinColumn({ name: 'boostProfileId', referencedColumnName: 'id' })
  boostprofile: BoostProfile;
}
