import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseUUIDPipe,
  SetMetadata,
  Inject,
} from '@nestjs/common';
import { MaresListService } from './mares-list.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { MareList } from 'src/mares-list/entities/mare-list.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CsvParser } from 'nest-csv-parser';
import { RoleGuard } from 'src/role/role.gaurd';
import { createReadStream } from 'fs';
import { csvFileFilter, csvFileName } from 'src/utils/file-uploading.utils';
import { UpdateListInfoDto } from 'src/mare-list-info/dto/update-list-info.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { MareListRes } from './dto/mare-list-res-info.dto';
import { FarmGuard } from 'src/farms/guards/farm.guard';
import { MareListFarmDto } from './dto/mare-list-farm.dto';
import { REQUEST } from '@nestjs/core';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';

var fs = require('fs');
const download = require('download');

class Entity {
  name: string;
  country: string;
  year: string;
  sire: string;
  dam: string;
  damcountry: string;
}

@ApiTags('Mares List')
@Controller({
  path: 'mares-list',
  version: '1',
})
export class MaresListController {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly maresListService: MaresListService,
    private readonly fileUploadsService: FileUploadsService,
    private readonly csvParser: CsvParser,
  ) {}

  /*
   * TODO: Check Is marelistId related to Loggedin users farmId or Not,
   * if Not throw Error
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all List',
  })
  @ApiPaginatedResponse(MareList)
  @SetMetadata('api', {
    id: 'MARES_LIST_GET_LIST',
    method: 'READ',
    farmIdIn: 'query',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Get()
  findAll(
    @Query() searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<MareList[]>> {
    return this.maresListService.findAll(searchOptionsDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download Template',
  })
  @ApiOkResponse({
    description: 'Download Template',
  })
  @SetMetadata('api', {
    id: 'MARES_LIST_DOWNLOAD_TEMPLATE',
    method: 'READ',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('template')
  async getTemplateFile(@Res() res) {
    const template = 'template.csv';
    res.setHeader('Content-type', 'text/csv');
    res.setHeader('Content-disposition', 'attachment; filename=' + template);
    const filestream = createReadStream('files/marelist/' + template);
    filestream.pipe(res);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download List',
  })
  @ApiOkResponse({
    description: 'Download File',
  })
  @SetMetadata('api', {
    id: 'MARES_LIST_DOWNLOAD',
    method: 'READ',
    farmIdIn: 'query',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Get('download/:id')
  async getInsightsReportFile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() searchOptionsDto: MareListFarmDto,
  ) {
    return this.maresListService.downloadMareList(id, searchOptionsDto.farmId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get the list details',
  })
  @ApiOkResponse({
    description: '',
    type: MareListRes,
    isArray: true,
  })
  @SetMetadata('api', {
    id: 'MARES_LIST_GET_DETAILS',
    method: 'READ',
    farmIdIn: 'query',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() mareListFarmDto: MareListFarmDto,
  ): Promise<MareListRes[]> {
    return this.maresListService.findOne(id, mareListFarmDto.farmId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update list Name',
  })
  @ApiOkResponse({
    description: 'Record Updated successfully!',
  })
  @SetMetadata('api', {
    id: 'MARES_LIST_UPDATE_LIST',
    method: 'UPDATE',
    farmIdIn: 'body',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Patch(':id')
  updateListName(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateListInfoDto,
  ) {
    return this.maresListService.update(id, updateDto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove list information and records from database',
  })
  @ApiOkResponse({
    description: 'Deleted successfully!',
  })
  @SetMetadata('api', {
    id: 'MARES_LIST_DELETE_LIST',
    method: 'DELETE',
    farmIdIn: 'body',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Delete(':id')
  delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() mareListFarmDto: MareListFarmDto,
  ) {
    return this.maresListService.delete(id, mareListFarmDto.farmId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload CSV file and inserting list records into database',
  })
  @ApiOkResponse({
    description: 'File uploaded successfully!',
  })
  @SetMetadata('api', {
    id: 'MARES_LIST_CREATE',
    method: 'CREATE',
    farmIdIn: 'params',
    farmKey: 'farmId',
  })
  @UseGuards(JwtAuthenticationGuard, FarmGuard)
  @Post(':farmId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'src/uploads/Mares_List',
        filename: csvFileName,
      }),
      fileFilter: csvFileFilter,
    }),
  )
  async uploadfile(
    @Param('farmId', new ParseUUIDPipe()) farmId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() request,
    @Body() body,
  ) {
    return this.maresListService.uploadFile(
      farmId,
      file,
      request.user,
      body.name,
    );
  }
}
