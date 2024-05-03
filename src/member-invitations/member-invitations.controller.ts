import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  UseGuards,
  Param,
  Query,
  Patch,
  Delete,
  SetMetadata,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { CreateUserInvitationDto } from './dto/create-user-invitation.dto';
import { CreateUserInvitationStallionDto } from './dto/create-member-stallion.dto';
import { InvitationLinkDto } from './dto/invitation-link.dto';
import { MemberInvitationsService } from './member-invitations.service';
import { SearchOptionsDto } from './dto/search-options.dto';
import { RemoveUserInvitationDto } from './dto/remove-member.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { GetAllMemberByFarmIdResponseDto } from './dto/get-all-member-by-farm-id-response.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { ValidateLinkResponseDto } from './dto/validate-link-response.dto';
import { UpdateUserInvitationDto } from './dto/update-member-invitation.dto';
import { ResendInvitationDto } from './dto/resend-invitation.dto';
import { FarmGuard } from 'src/farms/guards/farm.guard';

@ApiTags('Member Invitations')
@Controller({
  path: 'member-invitations',
  version: '1',
})
export class MemberInvitationsController {
  constructor(
    private readonly memberInvitationsService: MemberInvitationsService,
  ) {}

  @ApiOperation({
    summary: 'Get All Farm Members By farmId',
  })
  @ApiPaginatedResponse(GetAllMemberByFarmIdResponseDto)
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MEMBER_INVITATIONS_GET',
    method: 'READ',
    farmIdIn: 'params',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Get(':farmId')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() pageOptionsDto: SearchOptionsDto,
    @Param('farmId') farmId: string,
  ): Promise<PageDto<GetAllMemberByFarmIdResponseDto[]>> {
    return this.memberInvitationsService.findAll(farmId, pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Invite a member to Farm',
  })
  @ApiCreatedResponse({ description: 'Invited successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MEMBER_INVITATIONS_CREATE',
    method: 'CREATE',
    farmIdIn: 'body',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async inviteUser(@Body() invitationDto: CreateUserInvitationDto) {
    return this.memberInvitationsService.inviteUser(invitationDto);
  }

  @ApiOperation({
    summary: 'Validate Farm Invitation Url',
  })
  @ApiOkResponse({
    description: '',
    type: ValidateLinkResponseDto,
  })
  @Post('validate-link')
  @HttpCode(HttpStatus.OK)
  async validateInvitationLink(
    @Body() invitationLink: InvitationLinkDto,
  ): Promise<PageDto<ValidateLinkResponseDto[]>> {
    return this.memberInvitationsService.validateInvitationLink(
      invitationLink.hash,
    );
  }

  @ApiOperation({
    summary: 'Invite a member to Farm With Stallions',
  })
  @ApiCreatedResponse({ description: 'Member Invited successfully.' })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MEMBER_INVITATIONS_CREATE_WITH_STALLIONS',
    method: 'CREATE',
    farmIdIn: 'body',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Post('invite-stallion')
  @HttpCode(HttpStatus.CREATED)
  async addMemberStallions(
    @Body() stallionInvitationDto: CreateUserInvitationStallionDto,
  ) {
    return this.memberInvitationsService.addMemberStallions(
      stallionInvitationDto,
    );
  }

  @ApiOperation({
    summary: 'Invite a member to Farm',
  })
  @ApiOkResponse({ description: 'Updated successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MEMBER_INVITATIONS_UPDATE',
    method: 'UPDATE',
    farmIdIn: 'body',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Patch()
  @HttpCode(HttpStatus.CREATED)
  async updateUser(@Body() updateUserInvitationDto: UpdateUserInvitationDto) {
    return this.memberInvitationsService.updateUser(updateUserInvitationDto);
  }

  @ApiOperation({
    summary: 'Unlink a member from the farm',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MEMBER_INVITATIONS_DELETE',
    method: 'DELETE',
    farmIdIn: 'body',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  async removeMember(@Body() removeInvitationDto: RemoveUserInvitationDto) {
    return this.memberInvitationsService.remove(removeInvitationDto);
  }

  @ApiOperation({
    summary: 'Resend Invitation',
  })
  @ApiOkResponse({
    description: 'Invitation Sent Successfully',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'MEMBER_INVITATIONS_CREATE_RESEND',
    method: 'CREATE',
    farmIdIn: 'body',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Post('resend')
  @HttpCode(HttpStatus.OK)
  async resendInvitation(@Body() resendInvitationDto: ResendInvitationDto) {
    return this.memberInvitationsService.resendInvitation(resendInvitationDto);
  }
}
