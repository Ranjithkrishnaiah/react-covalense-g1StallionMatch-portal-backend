import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { MessageTemplate } from 'src/message-templates/entities/message-template.entity';

@Entity('tblMessageType')
export class MessageType extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  messageTypeName: string;

  @OneToMany(
    () => MessageTemplate,
    (messagetemplate) => messagetemplate.messagetype,
  )
  messagetype: MessageTemplate[];
}
