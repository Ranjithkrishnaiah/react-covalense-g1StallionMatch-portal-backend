import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
  SetMetadata,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { NominationRequestService } from './nomination-request.service';
import { NominationRequestDto } from './dto/nomination-request.dto';
import { SearchNominationRequestDto } from './dto/search-nomination-request.dto';
import { UpdateNominationRequestDto } from './dto/update-nomination-request.dto';
import { NominationRequestResponseDto } from './dto/nomination-request-response.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { UpdateNominationDto } from './dto/remove-cart-nomination.dto';

@ApiTags('Nomination Request')
@Controller({
  path: 'nomination-request',
  version: '1',
})
export class NominationRequestController {
  constructor(
    private readonly NominationRequestService: NominationRequestService,
  ) { }

  @ApiOperation({ summary: 'Get All Nomination Request - By Search' })
  @ApiOkResponse({
    description: '',
    type: NominationRequestResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'NOMINATIONREQUEST_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Query() pageOptionsDto: SearchNominationRequestDto,
  ): Promise<NominationRequestResponseDto[]> {
    return this.NominationRequestService.findAll(pageOptionsDto);
  }

  @ApiOperation({ summary: 'Delete Nomination Request - By id' })
  @ApiOkResponse({ description: 'Nomination Request deleted successfully.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':id')
  deleteNominationRequest(@Param('id') id: number) {
    return this.NominationRequestService.deleteNominationRequest(id);
  }

  @ApiOperation({ summary: 'Create Nomination Request' })
  @ApiCreatedResponse({
    description: 'Nomination Request created successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'NOMINATIONREQUEST_CREATE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() createNominationRequest: NominationRequestDto) {
    return this.NominationRequestService.create(createNominationRequest);
  }

  @ApiOperation({ summary: 'Create Nomination Request By Unregistered' })
  @ApiCreatedResponse({
    description: 'Nomination Request created successfully.',
  })
  @Post('unregistered')
  createUnregistered(@Body() createNominationRequest: NominationRequestDto) {
    return this.NominationRequestService.createUnregistered(
      createNominationRequest,
    );
  }

  @ApiOperation({ summary: 'Update Nomination Request - By id' })
  @ApiOkResponse({ description: 'Nomination Request updated successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'NOMINATIONREQUEST_UPDATE',
    method: 'UPDATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch()
  patch(@Body() updateNominationRequestDto: UpdateNominationRequestDto) {
    return this.NominationRequestService.updateNominationRequest(
      updateNominationRequestDto,
    );
  }

  @ApiOperation({ summary: 'Get Dynamic Pricing for TOS' })
  @ApiOkResponse({
    description: 'Get Dynamic Pricing for TOS.',
  })
  @Get(':id')
  dynamicricingForTOS(@Param('id') id: number) {
    return this.NominationRequestService.dynamicPricingTOS(id);
  }

  @ApiOperation({ summary: 'Update Nomination Request - By id for remove Cart' })
  @ApiOkResponse({ description: 'Nomination Request updated successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'NOMINATIONREQUEST_UPDATE',
    method: 'UPDATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('/remove-cart/:nominationId')
  removeCart(@Param('nominationId', new ParseUUIDPipe()) nominationId: string,
    @Body() nomination: UpdateNominationDto,) {
    return this.NominationRequestService.updateNominationRequestToRemoveCart(
      nominationId, nomination,
    );
  }
  @ApiOperation({ summary: 'Get Dynamic Pricing for toolTip' })
  @ApiOkResponse({
    description: 'Get Dynamic Pricing for toolTip.',
  })
  @Get(':currency/:fee/:feeCurrency')
  dynamicricingForToolTip(
    @Param('currency') currency: number,
    @Param('fee') fee: number,
    @Param('feeCurrency') feeCurrency: number,
  ) {
    return this.NominationRequestService.dynamicPricingForTooltip(currency, fee, feeCurrency);

  }
}