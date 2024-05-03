import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateMemberMareDto {
  @ApiProperty()
  @IsUUID()
  horseId: string;

  @IsOptional()
  @IsNumber()
  memberId: number;

  createdBy?: number | null;
}
