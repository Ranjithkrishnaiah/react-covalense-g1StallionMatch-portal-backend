import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMessageUnregisteredDto {
  @ApiProperty()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  farmId: string;

  @ApiProperty()
  @IsOptional()
  stallionId: string;

  @ApiProperty()
  @IsOptional()
  subject: string;

  @ApiProperty()
  @IsOptional()
  fullName: string;

  @ApiProperty()
  @IsOptional()
  fromName: string;

  @ApiProperty()
  @IsOptional()
  fromEmail: string;

  @ApiProperty()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsOptional()
  cob: number;

  @ApiProperty()
  @IsOptional()
  yob: number;

  @ApiProperty()
  @IsOptional()
  mareId: string;

  @ApiProperty()
  @IsOptional()
  mareName: string;

  @ApiProperty()
  @IsOptional()
  channelId: string;

  @ApiProperty()
  @IsNotEmpty()
  countryName: string;

  nominationRequestId: number | null;
  fromMemberId: string | null;
  msgChannelId: number | null;
}
