import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SocialShareTypeEnum } from 'src/social-share-types/social-share-type.enum';

export class CreateMemberSocialShareDto {
  @ApiProperty({ enum: SocialShareTypeEnum })
  @IsNotEmpty()
  socialShareType: SocialShareTypeEnum;
}
