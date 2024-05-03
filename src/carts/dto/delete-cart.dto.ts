import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteCartDto {
  @ApiProperty()
  @IsString()
  cartId: string;
}
