import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageChannel } from './entities/message-channel.entity';
import { CreateChannelDto } from 'src/messages/dto/create-channel.dto';
import { MembersService } from 'src/members/members.service';

@Injectable()
export class MessageChannelService {
  constructor(
    @InjectRepository(MessageChannel)
    private messageChannelRepository: Repository<MessageChannel>,
    private membersService: MembersService,
  ) {}
  /* Get message-channels */
  async findOne(fields) {
    const member = await this.membersService.findOne({ id: fields.txId });
    // if (member) {
    //   await this.messageChannelRepository.update(
    //     { txEmail: fields.txEmail, rxId: fields.rxId, isActive: true },
    //     { txId: member.id },
    //   );
    // }

    let queryBuilder = this.messageChannelRepository
      .createQueryBuilder('messagechannel')
      .select(
        'messagechannel.id as id, messagechannel.channelUuid as channelId, messagechannel.rxId as rxId, messagechannel.isActive as isActiveChannel',
      )
      .addSelect('member.memberuuid as memberId')
      .addSelect('message.subject as initialSubject')
      .innerJoin('messagechannel.member', 'member')
      .innerJoin('messagechannel.messagerecipient', 'messagerecipient')
      .innerJoin('messagerecipient.message', 'message')
      .andWhere('messagechannel.txId = :txId', {
        txId: fields.txId,
      })
      .andWhere('messagechannel.rxId = :rxId', { rxId: fields.rxId })
      .andWhere('messagechannel.isActive = :isActive', {
        isActive: fields.isActive,
      });
    const entities = await queryBuilder.getRawMany();

    return entities;
  }
  /* Get Channel Active Info */
  async findByFields(fields) {
    return this.messageChannelRepository.find({
      where: fields,
      select: ['isActive'],
    });
  }

  /* Create Channel */
  async create(createChannelDto: CreateChannelDto) {
    let msg = await this.messageChannelRepository.save(
      this.messageChannelRepository.create(createChannelDto),
    );
    return msg;
  }
  /* Get Channel  Info */
  async findWhere(fields) {
    return this.messageChannelRepository.find({
      where: fields,
    });
  }
  /* Update Channel  Info */
  async update(criteria, entities) {
    const response = await this.messageChannelRepository.update(
      criteria,
      entities,
    );
    return response;
  }
}
