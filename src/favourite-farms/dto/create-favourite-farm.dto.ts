import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateFavouriteFarmDto {
  @ApiProperty()
  @IsUUID()
  farmId: string;

  @IsOptional()
  @IsNumber()
  memberId: number;

  createdBy?: number | null;
}
