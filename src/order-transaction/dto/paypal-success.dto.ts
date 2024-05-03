import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaypalSuccessDto {
  @ApiProperty()
  @IsString()
  paymentId: string;

  @ApiProperty()
  @IsString()
  PayerID: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  couponId: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  postal_code: string;

  @ApiProperty({
    example:`AU`,
  })
  @IsOptional()
  //@IsNotEmpty()
  @IsString()
  country_code: string;

}
