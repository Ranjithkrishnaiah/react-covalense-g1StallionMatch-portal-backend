import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateFavouriteBroodmareSireDto {
  @ApiProperty({ example: '3580DC13-6EC1-EC11-B1E4-00155D01EE2B' })
  @IsUUID()
  horseId: string;

  @IsOptional()
  @IsNumber()
  memberId: number;

  mareId?: number | null;
  createdBy?: number | null;
}
