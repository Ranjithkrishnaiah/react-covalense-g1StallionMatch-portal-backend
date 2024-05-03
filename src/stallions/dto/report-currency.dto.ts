import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class currencyDto {
    @ApiPropertyOptional()
    @Type(() => String)
    @IsOptional()
    country?: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    member: string;
  
}
