import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { RoleService } from 'src/role/role.service';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from 'src/role/role.gaurd';

@Injectable()
export class FarmGuard extends RoleGuard implements CanActivate {
  constructor(
    @Inject(RoleService) public roleService: RoleService,
    public reflector: Reflector,
  ) {
    super(roleService, reflector);
  }
  async canActivate(context: ExecutionContext): Promise<any> {
    return super.canActivate(context);
  }
}
