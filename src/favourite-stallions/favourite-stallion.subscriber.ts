import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  LoadEvent,
} from 'typeorm';
import { FavouriteStallion } from './entities/favourite-stallion.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SoftRemoveEvent } from 'typeorm/subscriber/event/SoftRemoveEvent';

@EventSubscriber()
export class FavouriteStallionSubscriber
  implements EntitySubscriberInterface<FavouriteStallion>
{
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  favouriteStallion: FavouriteStallion;

  listenTo() {
    return FavouriteStallion;
  }

  async beforeInsert(event: InsertEvent<FavouriteStallion>) {}

  async afterInsert(event: InsertEvent<FavouriteStallion>) {
    this.eventEmitter.emit('addStallionToFav', event.entity);
  }

  async afterLoad(
    entity: FavouriteStallion,
    event?: LoadEvent<FavouriteStallion>,
  ) {
    this.favouriteStallion = entity;
  }

  async beforeRemove(event: RemoveEvent<FavouriteStallion>) {}

  afterRemove(event: RemoveEvent<FavouriteStallion>) {}

  beforeSoftRemove(event: SoftRemoveEvent<FavouriteStallion>) {}

  beforeUpdate?(event: UpdateEvent<FavouriteStallion>): Promise<any> | void {}

  afterSoftRemove(event: SoftRemoveEvent<FavouriteStallion>) {}

  public async afterUpdate(event: UpdateEvent<FavouriteStallion>) {}
}
