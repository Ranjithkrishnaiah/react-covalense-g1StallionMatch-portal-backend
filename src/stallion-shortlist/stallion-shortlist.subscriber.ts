import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  LoadEvent,
} from 'typeorm';
import { StallionShortlist } from './entities/stallion-shortlist.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SoftRemoveEvent } from 'typeorm/subscriber/event/SoftRemoveEvent';

@EventSubscriber()
export class StallionShortListSubscriber
  implements EntitySubscriberInterface<StallionShortlist>
{
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  stallionShortList: StallionShortlist;

  listenTo() {
    return StallionShortlist;
  }

  async beforeInsert(event: InsertEvent<StallionShortlist>) {}

  async afterInsert(event: InsertEvent<StallionShortlist>) {}

  async afterLoad(
    entity: StallionShortlist,
    event?: LoadEvent<StallionShortlist>,
  ) {
    this.stallionShortList = entity;
    this.eventEmitter.emit('stallionCreateShortlist', entity);
  }

  async beforeRemove(event: RemoveEvent<StallionShortlist>) {}

  afterRemove(event: RemoveEvent<StallionShortlist>) {}

  beforeSoftRemove(event: SoftRemoveEvent<StallionShortlist>) {}

  beforeUpdate?(event: UpdateEvent<StallionShortlist>) {}

  afterSoftRemove(event: SoftRemoveEvent<StallionShortlist>) {}

  public async afterUpdate(event: UpdateEvent<StallionShortlist>) {}
}
