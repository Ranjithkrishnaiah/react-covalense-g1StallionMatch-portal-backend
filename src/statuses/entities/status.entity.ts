import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { EntityHelper } from 'src/utils/entity-helper';

@Entity('tblMemberStatus')
export class Status extends EntityHelper {
  @ApiProperty()
  @PrimaryColumn()
  id: number;

  @Allow()
  @ApiProperty()
  @Column()
  statusName?: string;
}
