import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';

@ApiTags('invoice')
@Controller({
  path: 'invoice',
  version: '1',
})
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post()
  create() {
    return this.invoiceService.create();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  findAll() {
    return this.invoiceService.findAll();
  }
}
