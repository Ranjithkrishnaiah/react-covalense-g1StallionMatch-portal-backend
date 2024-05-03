import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request, Response, NextFunction } from 'express';
import { ReplaySubject } from 'rxjs';
import { FarmAuditService } from 'src/audit/farm-audit/farm-audit.service';

@Injectable()
export class MiddleWare implements NestMiddleware {
  constructor(
    private eventEmitter: EventEmitter2,
    private auditFarm: FarmAuditService,
  ) {}
  private logger = new Logger('HTTP');
  private sendIpAddressAndUserAgent = new ReplaySubject(1);

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, path: url, body: body } = request;
    const userAgent = request.get('user-agent') || '';
    next();
  }
}
