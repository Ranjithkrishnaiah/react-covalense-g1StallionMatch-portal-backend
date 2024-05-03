import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { NominationRequest } from 'src/utils/constants/nomination';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

export class SearchNominationRequestDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: NominationRequest,
    default: NominationRequest.OFFERPRICE,
  })
  @IsEnum(NominationRequest)
  @IsOptional()
  readonly sortBy?: NominationRequest = NominationRequest.OFFERPRICE;
}
