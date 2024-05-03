import { ApiResponseProperty } from '@nestjs/swagger';

export class PromotedStallionsResDto {
  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  hosrseName: string;

  @ApiResponseProperty()
  isPromoted: boolean;
}
