import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tblRole')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  RoleName: string;

  @Column()
  AccessPermissions: string;

  @Column()
  Rules: string;
}
