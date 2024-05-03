import { ApiResponseProperty } from '@nestjs/swagger';

export class footerSerachResponse {
  @ApiResponseProperty()
  search: string;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  uuid: string;

  @ApiResponseProperty()
  type: string;

}
