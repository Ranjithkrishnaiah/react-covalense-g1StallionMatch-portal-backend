import {
  Controller,
  Post,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Param,
  SetMetadata,
} from '@nestjs/common';
import { StallionNominationService } from './stallion-nominations.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { CreateStallionNominationDto } from './dto/create-stallion-nomination.dto';
import { StopStallionNominationDto } from './dto/stop-nomination.dto';
import { StallionGuard } from 'src/stallion-gaurd/stallion.gaurd';

@ApiTags('Stallion Nominations')
@Controller({
  path: 'stallion-nominations',
  version: '1',
})
export class StallionNominationController {
  constructor(
    private readonly StallionNominationService: StallionNominationService,
  ) {}

  @ApiOperation({
    summary: 'Activate Stallion Nomination',
  })
  @ApiOkResponse({ description: 'Nomination Activated Successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONNOMINATIONS_CREATE',
    method: 'CREATE',
    stallionIn: 'body',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Post()
  create(@Body() createStallionNomination: CreateStallionNominationDto) {
    return this.StallionNominationService.create(createStallionNomination);
  }

  @ApiOperation({
    summary: 'Deactivate Stallion Nomination',
  })
  @ApiOkResponse({ description: 'Nomination Stopped Successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONNOMINATIONS_UPDATE_STOPNOMINATION',
    method: 'UPDATE',
    stallionIn: 'params',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Post('stop-nomination/:stallionId')
  stopNomination(
    @Param('stallionId', new ParseUUIDPipe()) stallionId: string,
    @Body() stopNominationDto: StopStallionNominationDto,
  ) {
    return this.StallionNominationService.stopNomination(
      stallionId,
      stopNominationDto,
    );
  }
}
