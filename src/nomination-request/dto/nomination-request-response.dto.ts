import { ApiResponseProperty } from '@nestjs/swagger';

export class NominationRequestResponseDto {
  @ApiResponseProperty()
  nominationId: number;

  @ApiResponseProperty()
  mareId: number;

  @ApiResponseProperty()
  offerPrice: number;

  @ApiResponseProperty()
  cob: number;

  @ApiResponseProperty()
  yob: number;

  @ApiResponseProperty()
  isAccepted: boolean;

  @ApiResponseProperty()
  createdBy: number;

  @ApiResponseProperty()
  stallionId: number;

  @ApiResponseProperty()
  stallionUuid: string;

  @ApiResponseProperty()
  horseName: string;

  @ApiResponseProperty()
  height: number;

  @ApiResponseProperty()
  yeartoStud: number;

  @ApiResponseProperty()
  farmId: number;

  @ApiResponseProperty()
  farmUuid: string;

  @ApiResponseProperty()
  farmName: string;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  overview: string;
}
