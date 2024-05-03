import { PreferedNotification } from 'src/prefered-notifications/entities/prefered-notification.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tblNotificationType')
export class NotificationType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  notificationTypeName: string;

  @Column()
  notificationTypeCode: string;

  @OneToMany(
    () => PreferedNotification,
    (preferednotification) => preferednotification.notificationtype,
  )
  preferednotification: PreferedNotification;
}
