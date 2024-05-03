import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { EntityHelper } from 'src/utils/entity-helper';

@Entity('tblMemberRole')
export class MemberRole extends EntityHelper {
  @ApiProperty()
  @PrimaryColumn()
  id: number;

  @Allow()
  @ApiProperty()
  @Column()
  roleName?: string;
}
