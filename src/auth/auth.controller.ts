import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  Patch,
  ValidationPipe,
  Query,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthRegisterBreederDto } from './dto/auth-register-breeder.dto';
import { AuthRegisterFarmownerDto } from './dto/auth-register-farmowner.dto';
import JwtAuthenticationGuard from './guards/jwt-authentication.guard';
import { MembersService } from 'src/members/members.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { MemberFarmsService } from 'src/member-farms/member-farms.service';
import { AuthDto } from './dto/auth.dto';
import { AuthResendForgotPasswordLinkDto } from './dto/auth-resend-forgot-password-link.dto';
import { AuthRegisterFarmmemberDto } from './dto/auth-register-farmmember.dto';
import { UpdateMemberFullNameDto } from 'src/members/dto/update-member-fullName.dto';
import { UpdateMemberEmailDto } from 'src/members/dto/update-member-email.dto';
import { UpdateMemberProfileImageDto } from 'src/members/dto/create-member-profile-image.dto';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { EmailExistDto } from './dto/email-exist';
import { UpdateAddressDto } from 'src/member-address/dto/update-address.dto';
import { AuthLoginResponseDto } from './dto/auth-login-response-dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response-dto';
import { MemberResponseDto } from 'src/members/dto/member-response.dto';
import { AuthFarmsResponseDto } from './dto/auth-farms-response-dto';
import { ResetPasswordLinkResponseDto } from './dto/reset-password-link-response-dto';
import { UpdateMemberFullnameResponseDto } from 'src/members/dto/update-member-fullname-response.dto';
import { UpdateMemberEmailResponseDto } from 'src/members/dto/update-member-email-response.dto copy';
import { PresignedUrlDto } from './dto/presigned-url.dto';
import { AcceptFarmInvitationDto } from './dto/accept-farm-invitation.dto';
import { AuthGoogleLoginDto } from './dto/auth-google-login.dto';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    public service: AuthService,
    public memberService: MembersService,
    private memberFarmsService: MemberFarmsService,
  ) {}

  @ApiOperation({
    summary: 'Member Login',
  })
  @ApiOkResponse({
    description: '',
    type: AuthLoginResponseDto,
  })
  @Post('email/login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() loginDto: AuthEmailLoginDto,
  ): Promise<AuthLoginResponseDto> {
    return this.service.validateLogin(loginDto);
  }

  @ApiOperation({
    summary: 'Member Login with Google',
  })
  @ApiOkResponse({
    description: '',
    type: AuthLoginResponseDto,
  })
  @Post('google/login')
  @HttpCode(HttpStatus.OK)
  public async googleLogin(
    @Body() loginDto: AuthGoogleLoginDto,
  ): Promise<AuthLoginResponseDto>{
    return this.service.googleWithLogin(loginDto);
  }

  @ApiOperation({
    summary: 'Member Registration - Breeder',
  })
  @ApiOkResponse({
    description: 'User Created Successfully',
  })
  @Post('email/register/breeder')
  @HttpCode(HttpStatus.CREATED)
  async registerBreeder(@Body() createMemberDto: AuthRegisterBreederDto) {
    return this.service.registerBreeder(createMemberDto);
  }

  @ApiOperation({
    summary: 'Member Registration - FarmOwner',
  })
  @ApiOkResponse({
    description: 'User Created Successfully',
  })
  @Post('email/register/farm-owner')
  @HttpCode(HttpStatus.CREATED)
  async registerFarmAdmin(@Body() createMemberDto: AuthRegisterFarmownerDto) {
    return this.service.registerFarmAdmin(createMemberDto);
  }

  @ApiOperation({
    summary: 'Member Email Confirmation',
  })
  @ApiOkResponse({
    description: 'Email Confirmation Success',
  })
  @Post('email/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(@Body() confirmEmailDto: AuthConfirmEmailDto) {
    return this.service.confirmEmail(confirmEmailDto.hash);
  }

  @ApiOperation({
    summary: 'Resend Email Confirmation - After Login',
  })
  @ApiOkResponse({
    description: 'Verification link has been sent successfully',
  })
  @ApiBearerAuth()
  @Post('email/resend-confirm-email')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  public async resendConfirmEmail() {
    return this.service.resendConfirmEmail();
  }

  @ApiOperation({
    summary: 'Member - Forgot Password',
  })
  @ApiOkResponse({
    description: 'Password verification link has been sent successfully',
  })
  @Post('forgot/password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: AuthForgotPasswordDto) {
    return this.service.forgotPassword(forgotPasswordDto.email);
  }

  @ApiOperation({
    summary: 'Member - Reset Password',
  })
  @ApiOkResponse({
    description: 'Password updated successfully',
  })
  @Post('reset/password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto) {
    return this.service.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @ApiOperation({
    summary: 'Member - Refresh Token',
  })
  @ApiOkResponse({
    description: '',
    type: RefreshTokenResponseDto,
  })
  @ApiBearerAuth()
  @Post('refresh')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() request, @Body() token: RefreshTokenDto) {
    return await this.service.refreshTokens(token);
  }

  @ApiOperation({
    summary: 'Member - Logout',
  })
  @ApiOkResponse({
    description: 'User logged out successfully!',
  })
  @ApiBearerAuth()
  @Get('logout')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  async logOut(@Request() request) {
    await this.memberService.removeRefreshToken(request.user.email);
    request.res.setHeader('Authorization', null);
  }

  @ApiOperation({
    summary: 'Member - Close Account',
  })
  @ApiOkResponse({
    description: 'Closed account successfully!',
  })
  @ApiBearerAuth()
  @Get('close-account')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  async closeAccount(@Request() request) {
    const response = await this.memberService.closeAccount(request.user);
    request.res.setHeader('Authorization', null);
    return;
  }

  @ApiOperation({
    summary: 'Member Personal Details - After Login',
  })
  @ApiOkResponse({
    description: '',
    type: MemberResponseDto,
  })
  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  public async me(@Request() request) {
    return this.service.me(request.user);
  }

  @ApiOperation({
    summary: 'Member Update Password - After Login',
  })
  @ApiOkResponse({
    description: '',
    type: MemberResponseDto,
  })
  @ApiBearerAuth()
  @Patch('me/update-password')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  public async update(@Request() request, @Body() memberDto: AuthUpdateDto) {
    return this.service.updatePassword(request.user, memberDto);
  }

  @ApiOperation({
    summary: 'Member Update Address - After Login',
  })
  @ApiOkResponse({
    description: 'Address updated successfully',
  })
  @ApiBearerAuth()
  @Patch('me/update-address')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  public async updateMemberAddress(
    @Request() request,
    @Body() memberDto: UpdateAddressDto,
  ) {
    return this.service.updateMemberAddress(request.user, memberDto);
  }

  @ApiOperation({
    summary: 'Member Farms List - Including Access Levels',
  })
  @ApiOkResponse({
    description: '',
    type: AuthFarmsResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @Get('me/farms')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  public async getFarms(): Promise<AuthFarmsResponseDto[]> {
    return this.memberFarmsService.getMemberFarms();
  }

  @ApiOperation({
    summary: 'Accept Farm Invitaion',
  })
  @ApiOkResponse({
    description: 'Accepted Farm Invitaion',
  })
  @ApiBearerAuth()
  @Post('me/accept-farm-invitation')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  public async acceptFarmInvitation(
    @Body() invitationDto: AcceptFarmInvitationDto,
  ) {
    return this.service.acceptFarmInvitation(invitationDto);
  }

  /*Route for validating staging basic login - Ignore it for Production*/
  @ApiOperation({
    summary:
      'Route for validating staging basic login - Ignored it for Production',
  })
  @ApiOkResponse({
    description: '',
  })
  @Post('/basic')
  async basicHttpAuthorize(
    @Body(ValidationPipe) authDto: AuthDto,
  ): Promise<{ message: string }> {
    return this.service.basicHttpAuthorize(authDto);
  }

  @ApiOperation({
    summary: 'Validate a Forgot password link',
  })
  @ApiOkResponse({
    description: '',
    type: ResetPasswordLinkResponseDto,
  })
  @Post('forgot/password/validate-link')
  @HttpCode(HttpStatus.OK)
  async validateResetPasswordLink(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<ResetPasswordLinkResponseDto> {
    return this.service.validateResetPasswordLink(confirmEmailDto.hash);
  }

  @ApiOperation({
    summary: 'Resend a Forgot password link',
  })
  @ApiOkResponse({
    description: 'Forgot password link sent!',
  })
  @Post('forgot/password/resend-link')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordResendLink(
    @Body() resendLinkDto: AuthResendForgotPasswordLinkDto,
  ) {
    return this.service.resendForgotPasswordLink(resendLinkDto.hash);
  }

  @ApiOperation({
    summary: 'Member Registration - Farm Member',
  })
  @ApiOkResponse({
    description: 'User registered successfully!',
  })
  @Post('email/register/farm-member')
  @HttpCode(HttpStatus.CREATED)
  async registerFarmUser(@Body() farmMember: AuthRegisterFarmmemberDto) {
    return this.service.registerFarmUser(farmMember);
  }

  @ApiOperation({
    summary: 'Member - Update FullName',
  })
  @ApiOkResponse({
    description: '',
    type: UpdateMemberFullnameResponseDto,
  })
  @ApiBearerAuth()
  @Patch('me/fullName')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  public async updateMemberFullName(
    @Request() request,
    @Body() memberFullNameDto: UpdateMemberFullNameDto,
  ): Promise<UpdateMemberFullnameResponseDto> {
    return this.memberService.updateMemberFullName(
      request.user,
      memberFullNameDto,
    );
  }

  @ApiOperation({
    summary: 'Member - Update Email',
  })
  @ApiOkResponse({
    description: '',
    type: UpdateMemberEmailResponseDto,
  })
  @ApiBearerAuth()
  @Patch('me/email')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  public async updateMemberEmail(
    @Request() request,
    @Body() memberEmailDto: UpdateMemberEmailDto,
  ): Promise<UpdateMemberEmailResponseDto> {
    return this.memberService.updateMemberEmail(request.user, memberEmailDto);
  }

  @ApiOperation({
    summary: 'Member - Update Profile Image',
  })
  @ApiOkResponse({
    description: 'Successfully initiated upload profile image',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch('me/profile-image')
  profileImages(@Body() updateDto: UpdateMemberProfileImageDto) {
    return this.memberService.profileImageUpdate(updateDto);
  }

  @ApiOperation({
    summary: 'Member - Update Profile Image - PresignedUrl Generator',
  })
  @ApiOkResponse({
    description: '',
    type: PresignedUrlDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post('me/profile-image')
  async profileImageUpload(
    @Body() data: FileUploadUrlDto,
  ): Promise<PresignedUrlDto> {
    return await this.memberService.profileImageUpload(data);
  }

  @ApiOperation({
    summary: 'Member - Check Email Exist',
  })
  @ApiOkResponse({
    description: 'Your email is valid!',
  })
  @Get('/is-email-exist')
  @HttpCode(HttpStatus.OK)
  public async isEmailExist(@Query() emailExist: EmailExistDto) {
    return this.service.getUserByEmail(emailExist);
  }

  @ApiOperation({
    summary: 'Member - Accept Invitation',
  })
  @ApiOkResponse({
    description: 'Member - Accept Invitation',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch('me/accept-invitation')
  acceptInvitation(@Body() data: AuthConfirmEmailDto) {
    return this.service.acceptInvitation(data);
  }

  @ApiOperation({
    summary: 'Member - Get Hash',
  })
  @ApiOkResponse({
    description: 'Member - Get Hash',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('me/get-hash')
  getHash() {
    return this.service.getHash();
  }

  @ApiOperation({
    summary: 'Get Member Data Using Confirm Hash',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('email/confirm/:confirmHash')
  async getMemberDataByConfirmHash(@Param('confirmHash') confirmHash: string) {
    return this.service.getMemberDataByConfirmHash(confirmHash);
  }
}
