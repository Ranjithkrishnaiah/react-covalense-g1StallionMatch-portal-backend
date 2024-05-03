import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class AuthUpdateDto {
  @ApiProperty({ example: 'bWF0dGhld2Vubmlz' })
  @IsOptional()
  @IsNotEmpty()
  @MinLength(6)
  password?: string;
}
