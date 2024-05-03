import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export class MareListRes {
  @ApiResponseProperty()
  @ApiProperty({
    type: 'number',
    name: 'id',
  })
  id: number;

  @ApiResponseProperty()
  @ApiProperty({
    type: 'string',
    name: 'listname',
  })
  listname: string;

  @ApiResponseProperty()
  @ApiProperty({
    type: 'string',
    name: 'listFileName',
  })
  listFileName: string;

  @ApiResponseProperty()
  @ApiProperty({
    type: 'string',
    name: 'listFilePath',
  })
  listFilePath: string;
}
