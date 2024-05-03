import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CurrencyConversionCartDto {
  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty({
    example: [
      { cartId: '793DD84A-8641-4350-ACD3-FFD7E77F1327' },
      { cartId: '0DD1BE34-73F7-EC11-B1E8-00155D01EE2B' },
    ],
  })
  @IsOptional()
  cartList?: ArrayBuffer;
 // cartList?: Array<String>;
}
