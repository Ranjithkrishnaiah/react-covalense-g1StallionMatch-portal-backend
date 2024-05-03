import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageRecipient } from './entities/message-recipient.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateMsgRecepientDto } from './dto/create-recipient.dto';
import { RecipientResponseDto } from './dto/recipient-response.dto';

@Injectable({ scope: Scope.REQUEST })
export class MessageRecipientsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(MessageRecipient)
    private messageRecipientRepository: Repository<MessageRecipient>,
  ) {}

  /* Get All Messages - By Farm */
  async findAll(): Promise<RecipientResponseDto[]> {
    let queryBuilder = this.messageRecipientRepository
      .createQueryBuilder('messagerecipient')
      .select(
        'messagerecipient.id as msgRecipientId, messagerecipient.isRead as isRead, messagerecipient.recipientId as recipientId',
      )
      .orderBy('messagerecipient.id', 'DESC');
    const entities = await queryBuilder.getRawMany();
    return entities;
  }
  /* Create Message Recepients */
  async create(messageDto: CreateMsgRecepientDto) {
    let msgRxData = await this.messageRecipientRepository.save(
      this.messageRecipientRepository.create(messageDto),
    );
    return msgRxData;
  }

  findOne(fields) {
    return this.messageRecipientRepository.findOne({
      where: fields,
    });
  }
  /* Get Message Recepients Data */
  findResult(fields) {
    return this.messageRecipientRepository.find({
      where: fields,
    });
  }
  /* Update Message Recepients Data */
  async update(criteria, entities) {
    const response = await this.messageRecipientRepository.update(
      criteria,
      entities,
    );
    return response;
  }
}
