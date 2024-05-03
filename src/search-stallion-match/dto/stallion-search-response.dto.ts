import { ApiResponseProperty } from '@nestjs/swagger';

export class StallionSearchRespose {
  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  stallionName: string;

  @ApiResponseProperty()
  profilePic: string;

  @ApiResponseProperty()
  searchCount: number;

  @ApiResponseProperty()
  isPromoted: boolean;
}
