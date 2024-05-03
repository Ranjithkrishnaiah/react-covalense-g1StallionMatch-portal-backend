import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { PaymentMethod } from 'src/payment-methods/entities/payment-method.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('tblMemberPaymentTypeAccess')
export class MemberPaytypeAccess extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  paymentMethodId: number;

  @Column()
  customerId: string;

  @Column()
  clientSecret: string;

  @Column()
  paymentMethod: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @CreateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => PaymentMethod)
  @JoinColumn({ name: 'paymentMethodId', referencedColumnName: 'id' })
  paymentmethod: PaymentMethod;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;
}
