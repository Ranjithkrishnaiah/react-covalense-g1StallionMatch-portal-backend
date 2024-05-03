import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateChannelDto {
  @ApiProperty()
  @IsOptional()
  txEmail: string;

  @ApiProperty()
  @IsNumber()
  rxId: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean;

  channelUuid: string | null;

  txId: number | null;
}
