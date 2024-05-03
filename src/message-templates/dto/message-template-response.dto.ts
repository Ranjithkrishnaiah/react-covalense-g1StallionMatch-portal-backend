import { ApiResponseProperty } from '@nestjs/swagger';

export class MessageTemplateResponse {
  @ApiResponseProperty()
  templateId: number;

  @ApiResponseProperty()
  messageTitle: string;

  @ApiResponseProperty()
  messageText: string;

  @ApiResponseProperty()
  linkName: string;

  @ApiResponseProperty()
  msgDescription: string;

  @ApiResponseProperty()
  smFrontEnd: string;

  @ApiResponseProperty()
  forAdmin: boolean;

  @ApiResponseProperty()
  g1Slack: boolean;

  @ApiResponseProperty()
  breeder: boolean;

  @ApiResponseProperty()
  farmAdmin: boolean;

  @ApiResponseProperty()
  farmUser: boolean;

  @ApiResponseProperty()
  emailSms: boolean;

  @ApiResponseProperty()
  featureId: number;

  @ApiResponseProperty()
  featureName: string;

  @ApiResponseProperty()
  messageTypeId: number;

  @ApiResponseProperty()
  messageTypeName: string;
}
