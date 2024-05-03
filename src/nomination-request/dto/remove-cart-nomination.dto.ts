import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateNominationDto {
 
  @ApiProperty()
  @IsBoolean()
  isAccepted: Boolean;


  
}
