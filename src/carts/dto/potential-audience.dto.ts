import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class PotentialAudienceDto {
  @ApiProperty()
  @IsNotEmpty()
  stallions: Array<string>;

  @ApiProperty()
  @IsOptional()
  locations: Array<number>;

  @ApiProperty()
  @IsOptional()
  damSireSearchedUsers: Array<string>;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsBoolean()
  isTracked: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  isSearched: boolean;

  createdBy?: number | null;
}
