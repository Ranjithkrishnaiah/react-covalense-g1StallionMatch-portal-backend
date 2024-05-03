import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { PriceMinMaxOptionsDto } from 'src/stallions/dto/price-min-max-options.dto';

export class GuestPriceMinMaxOptionsDto extends PriceMinMaxOptionsDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  readonly stallionIds?: string;
}
