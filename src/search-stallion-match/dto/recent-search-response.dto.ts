import { ApiResponseProperty } from '@nestjs/swagger';

export class RecentSearchRespose {
  @ApiResponseProperty()
  stallionId: string;

  @ApiResponseProperty()
  stallionName: string;

  @ApiResponseProperty()
  mareId: string;

  @ApiResponseProperty()
  mareName: string;

  @ApiResponseProperty()
  stallionCountryCode: string;

  @ApiResponseProperty()
  mareCountryCode: string;

  @ApiResponseProperty()
  mareYob: number;

  @ApiResponseProperty()
  profilePic: string;

  @ApiResponseProperty()
  galleryImage: string;

  @ApiResponseProperty()
  isPromoted: boolean;
}
