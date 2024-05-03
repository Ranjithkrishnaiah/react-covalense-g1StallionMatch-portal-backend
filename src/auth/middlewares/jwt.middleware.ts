import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MembersService } from 'src/members/members.service';
import { StatusEnum } from 'src/statuses/statuses.enum';
import { AuthService } from '../auth.service';
import { SettingService } from 'src/setting/setting.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly membersService: MembersService,
    private readonly settingService: SettingService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token && token !== null) {
      try {
        const userSuspendConstants = await this.settingService.getData();
        const payload = await this.authService.verifyToken(token);
        const member = await this.membersService.findOneById(payload.id);
        let currentDateTime = new Date();
        let suspensionDateTime = new Date(member.suspendedOn);
        suspensionDateTime.setHours(
          suspensionDateTime.getHours() +
            userSuspendConstants.SM_ACCONT_SUSPENSION_LENGTH,
        );
        if (
          !member ||
          member.status.id === StatusEnum.closed ||
          member.status.id === StatusEnum.suspended
        ) {
          if (
            member.status.id === StatusEnum.suspended &&
            currentDateTime > suspensionDateTime &&
            member.suspendedOn != null
          ) {
            /* Reset Failed Login Count to 0 - If a Successful Login After Failed Login! */
            await this.membersService.updateFailedLoginCount(member.id, 0);
            await this.membersService.updateSuspendedOn(member.id, null);
          } else {
            throw new UnauthorizedException('Unauthorized');
          }
        }
      } catch (err) {
        throw new UnauthorizedException('Unauthorized');
      }
    }
    next();
  }
}
