import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MessagingMediaDownloadTypes } from 'src/utils/constants/messaging';

export class MediaDownloadOptionsDto {
  @ApiPropertyOptional({ enum: MessagingMediaDownloadTypes })
  @IsEnum(MessagingMediaDownloadTypes)
  readonly mediaDownloadType?: MessagingMediaDownloadTypes;
}
