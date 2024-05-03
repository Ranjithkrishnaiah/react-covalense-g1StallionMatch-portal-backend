import { ApiResponseProperty } from '@nestjs/swagger';

export class SocialShareTypeResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  socialShareType: string;
}
