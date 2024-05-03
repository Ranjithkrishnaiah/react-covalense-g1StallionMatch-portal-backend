import {
  Controller,
  Post,
  Patch,
  Body,
  UseGuards,
  Param,
  SetMetadata,
} from '@nestjs/common';
import { StallionPromotionService } from './stallion-promotions.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { CreateStallionPromotionDto } from './dto/create-stallion-promotion.dto';
import { StopStallionPromotionDto } from './dto/stop-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { RoleGuard } from 'src/role/role.gaurd';
import { StallionGuard } from 'src/stallion-gaurd/stallion.gaurd';

@ApiTags('Stallion Promotions')
@Controller({
  path: 'stallion-promotions',
  version: '1',
})
export class StallionPromotionController {
  constructor(
    private readonly StallionPromotionService: StallionPromotionService,
  ) {}

  @ApiOperation({ summary: 'Create Stallion Promotion' })
  @ApiCreatedResponse({
    description: 'Stallion Promotion created successfully.',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONPROMOTIONS_CREATE',
    method: 'CREATE',
    stallionIn: 'body',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Post()
  create(@Body() createStallionNomination: CreateStallionPromotionDto) {
    return this.StallionPromotionService.create(createStallionNomination);
  }

  @ApiOperation({ summary: 'Update Stallion Promotion' })
  @ApiOkResponse({ description: 'Stallion Promotion updated successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONPROMOTIONS_UPDATE',
    method: 'UPDATE',
    stallionIn: 'body',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Patch()
  updatePromotion(@Body() updatePromotionDto: UpdatePromotionDto) {
    return this.StallionPromotionService.updatePromotion(updatePromotionDto);
  }

  /*needs to remove this after replacing*/
  @ApiOperation({ summary: 'Stop Stallion Promotion - By promotion id' })
  @ApiOkResponse({ description: 'Stallion Promotion stoped successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONPROMOTIONS_UPDATE_STOPBYID',
    method: 'UPDATE',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':promotionId/stop-promotion-byid')
  stopPromotionById(
    @Param('promotionId') promotionId: number,
    @Body() stopStallionPromotionDto: StopStallionPromotionDto,
  ) {
    return this.StallionPromotionService.stopPromotionById(
      promotionId,
      stopStallionPromotionDto,
    );
  }

  @ApiOperation({ summary: 'Stop Stallion Promotion ' })
  @ApiOkResponse({ description: 'Stallion Promotion stoped successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONPROMOTIONS_UPDATE_STOPBYID',
    method: 'UPDATE',
    stallionIn: 'body',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Patch('stop-promotion')
  stopPromotionByStallionId(
    @Body() stopStallionPromotionDto: StopStallionPromotionDto,
  ) {
    return this.StallionPromotionService.stopPromotionByStallionId(
      stopStallionPromotionDto,
    );
  }

  @ApiOperation({ summary: 'Stop Stallion Promotion Manually' })
  @ApiOkResponse({ description: 'Manual Stallion Promotion stopped Successfully.' })
  @ApiBearerAuth()
  @SetMetadata('api', {
    id: 'STALLIONPROMOTIONS_UPDATE_STOPBYID',
    method: 'UPDATE',
    stallionIn: 'body',
    stallionKey: 'stallionId',
  })
  @UseGuards(JwtAuthenticationGuard, StallionGuard)
  @Patch('stop-promotion-manually')
  stopPromotionManuallyByStallionId(
    @Body() stopStallionPromotionDto: StopStallionPromotionDto,
  ) {
    return this.StallionPromotionService.stopPromotionManuallyByStallionId(
      stopStallionPromotionDto,
    );
  }
}
