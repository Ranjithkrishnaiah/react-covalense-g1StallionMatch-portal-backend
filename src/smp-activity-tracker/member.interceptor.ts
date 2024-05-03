import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { SmpActivityTrackerService } from 'src/smp-activity-tracker/smp-activity-tracker.service';

@Injectable()
export class MemberInterceptor implements NestInterceptor {
  constructor(private smpTrackerService: SmpActivityTrackerService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    let self = this;
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();

    return next.handle().pipe(
      map(async (data) => {
        if (req.user) {
          await self.smpTrackerService.updateMemberLastActive(req.user.id);
          if (req.method === 'GET') {
            await self.smpTrackerService.getAction({
              request: req,
              data: data,
              ip: req.ip,
            });
          } else if (req.method === 'POST') {
            await self.smpTrackerService.postAction({
              request: req,
              data: data,
              ip: req.ip,
            });
          } else if (req.method === 'PATCH') {
            await self.smpTrackerService.updateAction({
              request: req,
              data: data,
              ip: req.ip,
            });
          } else if (req.method === 'DELETE') {
            await self.smpTrackerService.deleteAction({
              request: req,
              data: data,
              ip: req.ip,
            });
          }
        } else {
          if (req.method === 'GET') {
            await self.smpTrackerService.getAction({
              request: req,
              data: data,
              ip: req.ip,
            });
          } else if (req.method === 'POST') {
            await self.smpTrackerService.postAction({
              request: req,
              data: data,
              ip: req.ip,
            });
          }
        }
        return data;
      }),
    );
  }
}
