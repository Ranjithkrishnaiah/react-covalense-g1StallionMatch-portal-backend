import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tblAdminPageSettings')
export class AdminPageSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  moduleId: number;

  @Column()
  pageSettingsUuid: string;

  @Column()
  settingsResponse: string;

  @Column()
  createdBy: number;

  @Column()
  createdOn: Date;

  @Column()
  modifiedBy: number;

  @Column()
  modifiedOn: Date;
}
