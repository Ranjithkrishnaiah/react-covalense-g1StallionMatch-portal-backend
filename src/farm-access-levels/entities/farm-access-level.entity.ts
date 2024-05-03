import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { MemberInvitation } from 'src/member-invitations/entities/member-invitation.entity';

@Entity('tblFarmAccessLevel')
export class FarmAccessLevel extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  accessName: string;

  @Column({ nullable: false })
  roleId: number;

  @OneToMany(() => MemberFarm, (memberfarm) => memberfarm.farmaccesslevel)
  memberfarms: MemberFarm[];

  @OneToMany(
    () => MemberInvitation,
    (memberinvitation) => memberinvitation.farmaccesslevel,
  )
  memberinvitation: MemberInvitation[];
}
