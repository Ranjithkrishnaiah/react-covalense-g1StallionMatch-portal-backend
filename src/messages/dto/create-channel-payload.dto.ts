import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateChannelPayloadDto {
  @ApiProperty()
  @IsString()
  rxId: string;

  @ApiProperty()
  @IsString()
  txEmail: string;

  @ApiProperty()
  @IsOptional()
  txId: number;

  @ApiProperty()
  @IsOptional()
  stallionId: string;

  channelUuid: string | null;
}
