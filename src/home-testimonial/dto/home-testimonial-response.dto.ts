import { ApiResponseProperty } from '@nestjs/swagger';

export class HomeTestimonialResponseDto {
  @ApiResponseProperty()
  imagepath: string;

  @ApiResponseProperty()
  fullname: string;

  @ApiResponseProperty()
  company: string;

  @ApiResponseProperty()
  isActive: boolean;

  @ApiResponseProperty()
  note: string;

  @ApiResponseProperty()
  createdBy: number;

  @ApiResponseProperty()
  createdOn: Date;

  @ApiResponseProperty()
  modifiedBy: number;

  @ApiResponseProperty()
  modifiedOn: Date;

  @ApiResponseProperty()
  countryName: string;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  stateName: string;
}
