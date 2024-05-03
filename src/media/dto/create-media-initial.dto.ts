import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateMediaInitialDto {
  @ApiProperty()
  @IsUUID()
  mediauuid: string;

  markForDeletion?: boolean | null;
  createdBy?: number | null;
  createdOn?: Date | null;
}
