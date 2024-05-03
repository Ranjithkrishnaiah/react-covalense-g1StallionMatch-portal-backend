import { AuditService } from 'src/audit/audit.service';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
} from 'typeorm';
import { FavouriteStallion } from './entities/favourite-stallion.entity';

@EventSubscriber()
export class FavouriteStallionsSubscriber
  implements EntitySubscriberInterface<FavouriteStallion>
{
  constructor(
    private readonly connection: Connection,
    private auditService: AuditService,
  ) {
    connection.subscribers.push(this);
  }
  listenTo() {
    return FavouriteStallion;
  }

  async afterInsert(event: InsertEvent<FavouriteStallion>) {}
}
