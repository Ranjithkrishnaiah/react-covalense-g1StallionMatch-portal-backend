import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ShareSMSearchResultAuthDto } from './share-sm-search-result-auth.dto';

export class ShareSMSearchResultPublicDto extends ShareSMSearchResultAuthDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fromName?: string;
}
