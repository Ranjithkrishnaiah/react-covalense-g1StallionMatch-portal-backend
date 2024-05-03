import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { FavouriteFarm } from './entities/favourite-farm.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SoftRemoveEvent } from 'typeorm/subscriber/event/SoftRemoveEvent';

@EventSubscriber()
export class FavouriteFarmSubscriber
  implements EntitySubscriberInterface<FavouriteFarm>
{
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  farmFav: FavouriteFarm;

  listenTo() {
    return FavouriteFarm;
  }

  async afterInsert(event: InsertEvent<FavouriteFarm>) {
    this.eventEmitter.emit('addFarmToFav', event.entity);
  }

  async beforeInsert(entity: InsertEvent<FavouriteFarm>) {}

  async afterLoad(entity: FavouriteFarm) {
    this.farmFav = entity;
    this.eventEmitter.emit('galleryImageUpload', entity);
  }

  async beforeRemove(event: RemoveEvent<FavouriteFarm>) {}

  async afterRemove(event: RemoveEvent<FavouriteFarm>) {}

  beforeSoftRemove(event: SoftRemoveEvent<FavouriteFarm>) {}

  /**
   * Called after entity removal.
   */
  afterSoftRemove(event: SoftRemoveEvent<FavouriteFarm>) {}

  async afterUpdate(event: UpdateEvent<FavouriteFarm>) {}

  public async beforeUpdate(event: UpdateEvent<FavouriteFarm>) {}

  public async afterUpate(event: UpdateEvent<FavouriteFarm>) {}
}
