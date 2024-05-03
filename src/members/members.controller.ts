import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { PageViewCountryDto } from 'src/page-view/dto/page-view-country.dto';

@ApiTags('Members')
@Controller({
  path: 'members',
  version: '1',
})
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @ApiOperation({
    summary: 'Capture home page view count',
  })
  @ApiOkResponse({
    description: 'Page view created successfully',
  })
  @Post('home-page-view')
  async homePageView(
    @Body() data: PageViewCountryDto,
  ) {
    return await this.membersService.homePageView(data);
  }

  @ApiOperation({
    summary: 'Capture home page view count - Auth',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post('home-page-view-auth')
  async authHomePageView(
    @Body() data: PageViewCountryDto,
  ) {
    return await this.membersService.homePageView(data);
  }


  @ApiOperation({
    summary: 'Capture reports overview page view count',
  })
  @ApiOkResponse({
    description: 'Page view created successfully',
  })
  @Post('reports-overview-page-view')
  async reportsOverviewPageView(
    @Body() data: PageViewCountryDto,
  ) {
    return await this.membersService.reportsOverviewPageView(data);
  }

  @ApiOperation({
    summary: 'Capture reports overview page view count - Auth',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post('reports-overview-page-view-auth')
  async authReportsOverviewPageView(
    @Body() data: PageViewCountryDto,
  ) {
    return await this.membersService.reportsOverviewPageView(data);
  }
}
