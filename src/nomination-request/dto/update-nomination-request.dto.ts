import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateNominationRequestDto {
  @ApiProperty()
  @IsNumber()
  requestId: number;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  counterOfferPrice: number;

  @ApiProperty()
  @IsBoolean()
  isAccepted: Boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDeclined: Boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isCounterOffer: Boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  channelId: string;

  @ApiProperty()
  @IsOptional()
  fromMembeId: string;

  @ApiProperty()
  @IsOptional()
  mediauuid: string;
}
