import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsOptional()
  message: string;

  @ApiProperty()
  @IsNotEmpty()
  farmId: string;

  @ApiProperty()
  @IsOptional()
  stallionId: string;

  @ApiProperty()
  @IsOptional()
  subject: string;

  @ApiProperty()
  @IsOptional()
  channelId: string;

  @ApiProperty()
  @IsOptional()
  fromMemberUuid: string;

  nominationRequestId: number | null;
  msgChannelId: number | null;
  createdBy: number | null;
}
