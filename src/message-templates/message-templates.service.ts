import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageTemplate } from './entities/message-template.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateMessageTemplateDto } from './dto/create-message-template.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { PageMetaDto } from 'src/utils/dtos/page-meta.dto';
import { MessageTemplateResponse } from './dto/message-template-response.dto';

@Injectable({ scope: Scope.REQUEST })
export class MessageTemplatesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MessageTemplate)
    private messageTemplateRepository: Repository<MessageTemplate>,
  ) {}
  /* Get All Message Templates by Search */
  async findAll(
    searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<MessageTemplateResponse[]>> {
    let queryBuilder = this.messageTemplateRepository
      .createQueryBuilder('messagetemplate')
      .select(
        'messagetemplate.id as templateId, messagetemplate.messageTitle, messagetemplate.messageText, messagetemplate.linkName, messagetemplate.msgDescription,messagetemplate.smFrontEnd,messagetemplate.forAdmin,messagetemplate.g1Slack,messagetemplate.breeder,messagetemplate.farmAdmin,messagetemplate.farmUser,messagetemplate.emailSms',
      )
      .addSelect('feature.id as featureId, feature.featureName as featureName')
      .addSelect('messagetype.id as messageTypeId, messagetype.messageTypeName')
      .innerJoin('messagetemplate.feature', 'feature')
      .leftJoin('messagetemplate.messagetype', 'messagetype')
      .orderBy('messagetemplate.id', 'DESC')
      .offset(searchOptionsDto.skip)
      .limit(searchOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const entities = await queryBuilder.getRawMany();
    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: searchOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }
  /* Create Message Template */
  async createMessageTemplate(messageTemplateDto: CreateMessageTemplateDto) {
    const member = this.request.user;
    let msgTemplateData = {
      ...messageTemplateDto,
      createdBy: member['id'],
    };

    let msgTemplate = await this.messageTemplateRepository.save(
      this.messageTemplateRepository.create(msgTemplateData),
    );

    return msgTemplate;
  }
  /* Get Message Template */
  findOne(fields) {
    return this.messageTemplateRepository.findOne({
      where: fields,
    });
  }
  /* Get Message Template By Id */
  async getMessageTemplateById(messageTemplateById) {
    return this.messageTemplateRepository.findOne({
      id: messageTemplateById,
    });
  }

  /* Get Message Template By Uuid */
  async getMessageTemplateByUuid(messageTemplateByUuid) {
    return this.messageTemplateRepository.findOne({
      messageTemplateUuid: messageTemplateByUuid,
    });
  }
}
