import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTestimonialDto {
  @ApiProperty({ example: 'Title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Coolmore International' })
  @IsNotEmpty()
  @IsString()
  company: string;

  @ApiProperty({ example: 'Just a Description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  isActive: false;
  modifiedBy?: number | null;
}
