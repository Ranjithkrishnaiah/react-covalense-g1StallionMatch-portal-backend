import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { StallionReasonsService } from './stallion-reasons.service';

@ApiTags('Stallion Reasons')
@Controller({
  path: 'stallion-reasons',
  version: '1',
})
export class StallionReasonsController {
  constructor(
    private readonly stallionReasonsService: StallionReasonsService,
  ) {}

  @ApiOperation({
    summary: 'Get all Stallion Retire Reasons',
  })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          reasonName: { type: 'string' },
        },
      },
    },
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONREASONS_GET_RETIRE_REASON',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  findAll() {
    return this.stallionReasonsService.findAll();
  }
}
