import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  constructor(private eventEmitter: EventEmitter2) {}
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, path: url, body: body } = request;
    const userAgent = request.get('user-agent') || '';
    this.eventEmitter.emit('toCreateStallion', request);
    response.on('close', () => {
      const { statusCode } = response;
      this.eventEmitter.emit('');
    });

    next();
  }
}
