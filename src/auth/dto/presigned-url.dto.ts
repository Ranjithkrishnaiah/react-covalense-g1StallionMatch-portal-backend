import { ApiResponseProperty } from '@nestjs/swagger';

export class PresignedUrlDto {
  @ApiResponseProperty()
  url: string;
}
