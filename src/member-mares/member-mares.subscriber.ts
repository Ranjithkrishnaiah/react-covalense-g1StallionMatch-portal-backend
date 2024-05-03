import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { MemberMare } from './entities/member-mare.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RecoverEvent } from 'typeorm/subscriber/event/RecoverEvent';
import { SoftRemoveEvent } from 'typeorm/subscriber/event/SoftRemoveEvent';

@EventSubscriber()
export class MemberMareSubscriber
  implements EntitySubscriberInterface<MemberMare>
{
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  memberMare: MemberMare;

  listenTo() {
    return MemberMare;
  }

  async afterInsert(event: InsertEvent<MemberMare>) {
    this.eventEmitter.emit('createMemberMare', event.entity);
  }

  async beforeInsert(entity: InsertEvent<MemberMare>) {}

  async beforeRemove(event: RemoveEvent<MemberMare>) {}

  async afterRemove(event: RemoveEvent<MemberMare>) {}

  beforeSoftRemove(event: SoftRemoveEvent<any>) {}

  /**
   * Called after entity removal.
   */
  afterSoftRemove(event: SoftRemoveEvent<any>) {}

  async afterLoad(entity: MemberMare) {
    this.memberMare = entity;
  }

  async afterUpdate(event: UpdateEvent<MemberMare>) {}

  public async beforeUpdate(event: UpdateEvent<MemberMare>) {}

  public async afterUpate(event: UpdateEvent<MemberMare>) {}

  afterRecover(event: RecoverEvent<any>) {}
}
