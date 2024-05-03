import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { MemberPaymentAccessService } from './member-paytype-access.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiTags('Member Paytype Access')
@Controller({
  path: 'member-paytype-access',
  version: '1',
})
export class MemberPaytypeAccessController {
  constructor(
    private readonly memberPaymentAccessService: MemberPaymentAccessService,
  ) {}

  @ApiOperation({
    summary: 'Add Member Payment Type Access',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post('customer')
  createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.memberPaymentAccessService.createCustomer(createCustomerDto);
  }

  @ApiOperation({
    summary: 'Update Member Payment Type Access',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully Updated.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch()
  updateDetails(@Body() createCustomerDto: CreateCustomerDto) {
    return this.memberPaymentAccessService.updateDetails(createCustomerDto);
  }

  @ApiOperation({
    summary: 'Render Card',
  })
  @ApiCreatedResponse({ description: '' })
  @Get('customer/render-card/:memberId/:uniqueIdentity')
  renderCard(@Param('memberId') memberId: string, @Res() res) {
    return this.memberPaymentAccessService.renderCard(memberId, res);
  }

  @ApiOperation({
    summary: 'Render Card',
  })
  @ApiCreatedResponse({ description: '' })
  @Get('customer/update-card/:memberId/:uniqueIdentity')
  updateCard(@Param('memberId') memberId: string, @Res() res) {
    return this.memberPaymentAccessService.updateCard(memberId, res);
  }

  @ApiOperation({
    summary: 'Get customer details',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @Get(':paymentMethodId/:memberId')
  getCustomerDetails(
    @Param('paymentMethodId') paymentMethodId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.memberPaymentAccessService.getCustomerDetails(
      paymentMethodId,
      memberId,
    );
  }

  @ApiOperation({
    summary: 'Get All',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  findAll() {
    return this.memberPaymentAccessService.findAll();
  }

  @ApiOperation({
    summary: 'Remove Member Payment Type Access',
  })
  @ApiCreatedResponse({
    description: 'The record has been removed successfully ',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Delete()
  deleteCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.memberPaymentAccessService.deleteCustomer(createCustomerDto);
  }
}
