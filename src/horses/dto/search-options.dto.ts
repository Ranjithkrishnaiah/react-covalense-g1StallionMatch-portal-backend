import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { Gelding } from '../gelding.enum';
import { Gender } from '../gender.enum';
import { Thoroughbred } from '../thoroughbred.enum';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly horseName?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly nationality?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly yob?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly colour?: number;

  @ApiPropertyOptional({ enum: Gender, default: Gender.Male })
  @IsEnum(Gender)
  @IsOptional()
  readonly sex?: Gender;

  @ApiPropertyOptional({ enum: Gelding })
  @IsEnum(Gelding)
  @IsOptional()
  readonly gelding?: Gelding;

  @ApiPropertyOptional({ enum: Thoroughbred })
  @IsEnum(Thoroughbred)
  @IsOptional()
  readonly thoroughbred?: Thoroughbred;
}
