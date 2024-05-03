import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { EntityHelper } from 'src/utils/entity-helper';
import { MessageTemplate } from 'src/message-templates/entities/message-template.entity';

@Entity('tblFeature')
export class Feature extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  featureName: string;

  @OneToMany(
    () => MessageTemplate,
    (messagetemplate) => messagetemplate.feature,
  )
  messagetemplate: MessageTemplate[];
}
