import { ApiResponseProperty } from '@nestjs/swagger';

export class FarmMediaResDto {
  @ApiResponseProperty()
  mediaInfoId: number;

  @ApiResponseProperty()
  title: string;

  @ApiResponseProperty()
  description: string;

  @ApiResponseProperty()
  createdOn: Date;

  @ApiResponseProperty()
  isDeleted: boolean;

  @ApiResponseProperty()
  mediaInfoFiles: Array<string>;
}
