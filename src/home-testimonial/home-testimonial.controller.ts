import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HomeTestimonialResponseDto } from './dto/home-testimonial-response.dto';
import { HomeTestimonialsService } from './home-testimonial.service';

@ApiTags('Home Testimonial')
@Controller({
  path: 'home-testimonial',
  version: '1',
})
export class HomeTestimonialController {
  constructor(
    private readonly homeTestimonialService: HomeTestimonialsService,
  ) {}

  @ApiOperation({
    summary: 'Get Testimonial By page type',
  })
  @ApiOkResponse({
    description: '',
    type: HomeTestimonialResponseDto,
    isArray: true,
  })
  @Get(':pageType')
  findAll(
    @Param('pageType') pageType: string,
  ): Promise<HomeTestimonialResponseDto[]> {
    return this.homeTestimonialService.findAll(pageType);
  }

  @ApiOperation({
    summary: 'Get Finger Tips',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiOperation({
    summary: 'Get Testimonial By id',
  })
  @ApiOkResponse({
    description: '',
    type: HomeTestimonialResponseDto,
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<HomeTestimonialResponseDto> {
    return this.homeTestimonialService.findOne(+id);
  }
}
