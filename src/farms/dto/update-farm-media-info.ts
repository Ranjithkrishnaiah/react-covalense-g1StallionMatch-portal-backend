import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { CreateMediaDto } from 'src/farm-media-info/dto/create-media.dto';

export class UpdateFarmMediaInfoDto {
  @ApiProperty({ type: [CreateMediaDto] })
  @IsOptional()
  @Type(() => CreateMediaDto)
  mediaInfos: CreateMediaDto[];
}
