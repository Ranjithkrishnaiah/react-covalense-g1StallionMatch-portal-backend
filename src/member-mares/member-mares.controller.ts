import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Request,
  Query,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { MemberMaresService } from './member-mares.service';
import { CreateMemberMareDto } from './dto/create-member-mare.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { MemberMare } from './entities/member-mare.entity';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { PageDto } from 'src/utils/dtos/page.dto';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiTags('Member Mare')
@Controller({
  path: 'member-mares',
  version: '1',
})
export class MemberMaresController {
  constructor(private readonly memberMaresService: MemberMaresService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Member Mare',
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  @SetMetadata('api', {
    id: 'MEMBER_MARE_CREATE',
    method: 'CREATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Request() request, @Body() createMemberMareDto: CreateMemberMareDto) {
    return this.memberMaresService.create(request.user, createMemberMareDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search Member Mare',
  })
  @ApiPaginatedResponse(MemberMare)
  @SetMetadata('api', {
    id: 'MEMBER_MARE_GET',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Request() request,
    @Query() pageOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<MemberMare>> {
    return this.memberMaresService.findAll(request.user, pageOptionsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Member Mare',
  })
  @ApiOkResponse({
    description: 'Deleted Successfully',
  })
  @SetMetadata('api', {
    id: 'MEMBER_MARE_DELETE',
    method: 'DELETE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete()
  remove(@Body() deleteMemberMareDto: CreateMemberMareDto) {
    return this.memberMaresService.remove(deleteMemberMareDto);
  }
}
