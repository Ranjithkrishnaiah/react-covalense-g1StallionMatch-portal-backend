import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class NominationRequestDto {
  @ApiProperty()
  @IsUUID()
  stallionId: string;

  @ApiProperty()
  @IsUUID()
  farmId: string;

  @ApiProperty()
  @IsString()
  mareId: string | null;

  @ApiProperty()
  @IsString()
  mareName: string | null;

  @ApiProperty()
  @IsNumber()
  offerPrice: number;

  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty()
  @IsNumber()
  cob: number;

  @ApiProperty()
  @IsNumber()
  yob: number;

  @ApiProperty()
  @IsOptional()
  fromMemberId: string;

  @ApiProperty()
  @IsString()
  channelId: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsOptional()
  subject: string;

  @ApiProperty()
  @IsOptional()
  fullName: string;

  @ApiProperty()
  @IsOptional()
  email: string;

  isAccepted: Boolean | false;
  createdBy?: number | null;
}
