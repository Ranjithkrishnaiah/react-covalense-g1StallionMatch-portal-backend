import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMessageTemplateDto {
  @ApiProperty()
  @IsNotEmpty()
  messageTitle: string;

  @ApiProperty()
  @IsNotEmpty()
  messageText: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  featureId: number;
}
