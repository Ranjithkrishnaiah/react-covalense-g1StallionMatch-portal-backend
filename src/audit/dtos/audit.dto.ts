import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export class AuditDto {
  @ApiProperty({
    example: 'Any activity that has changed like Horse/Farm Created/Removed',
  })
  id;

  @ApiResponseProperty()
  stallionId: number;

  @ApiResponseProperty()
  farmID: number;

  @ApiResponseProperty()
  horseId: number;

  @ApiResponseProperty()
  ipAddress: string;

  @ApiResponseProperty()
  auditComments: string;

  @ApiResponseProperty()
  auditUser: string;

  @ApiResponseProperty()
  pageSource: string;

  @ApiResponseProperty()
  activityType: string;

  @ApiResponseProperty()
  createdBy: string;

  @ApiResponseProperty()
  createdOn: string;

  @ApiResponseProperty()
  modifiedBy: string;

  @ApiResponseProperty()
  modifiedOn: string;

  @ApiResponseProperty()
  userAgent: string;
}
