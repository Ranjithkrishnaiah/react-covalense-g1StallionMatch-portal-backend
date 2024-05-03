import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { RoleService } from 'src/role/role.service';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from 'src/role/role.gaurd';

@Injectable()
export class StallionGuard extends RoleGuard implements CanActivate {
  public stallionUuid;
  constructor(
    @Inject(RoleService) public roleService: RoleService,
    public reflector: Reflector,
  ) {
    super(roleService, reflector);
  }
  async canActivate(context: ExecutionContext): Promise<any> {
    let allow = true;
    try {
      console.log(':: INSDIE STALLATION GAURD');
      const request = context.switchToHttp().getRequest();
      console.log('::::Inside STALLATION GAURD canActivate:::');
      const apiDetails = this.reflector.get<any>('api', context.getHandler());
      this.methodName = apiDetails.method;
      this.id = apiDetails.id;
      if (
        apiDetails.stallionIn !== undefined &&
        apiDetails.stallionIn === 'params'
      ) {
        let key = apiDetails['stallionKey'];
        console.log('::: STALLATION GAURD KEY IS ::::::::', key);
        this.stallionUuid = request.params[key];
      }
      if (
        apiDetails.stallionIn !== undefined &&
        apiDetails.stallionIn === 'body'
      ) {
        let key = apiDetails['stallionKey'];
        console.log(
          '::: STALLATION GAURD KEY IS ::::::REQ BODY::',
          key,
          request.body,
        );
        this.stallionUuid = request.body[key];
      }
      if (
        apiDetails.stallionIn !== undefined &&
        apiDetails.stallionIn === 'query'
      ) {
        let key = apiDetails['stallionKey'];
        console.log('::: STALLATION GAURD KEY IS ::::::::', key);
        this.stallionUuid = request.query[key];
      }
      await this.validateRole(request);
      console.log(
        ':::::STALLATION GAURD REQUEST DETAILS ARE::::::::::::::::::::::::::::::: :::',
      );
    } catch (error) {
      console.log(':::Error::in::canActivate STALLATION GAURD::', error);
      allow = false;
      throw error;
    }

    return allow;
  }
  public async validateRole(request: any) {
    let accessData = null;
    try {
      let scopeType = null;
      switch (this.methodName) {
        case 'CREATE':
          scopeType = 'canWrite';
          break;
        case 'UPDATE':
          scopeType = 'canWrite';
          break;
        case 'READ':
          scopeType = 'canRead';
          break;
        case 'DELETE':
          scopeType = 'canDelete';

          break;
      }
      console.log(
        ':: STALLATION GAURD LOGGED IN USER TOKEN IS ::',
        request.user,
      );
      let rules: any = await this.roleService.findStallionGaurdScopes(
        scopeType,
        this.id,
        request.user.id,
        this.stallionUuid || null,
        request.user.roleId,
      );
      console.log(
        '::  STALLATION GAURD SCOPE DETAILS ARE ::: ::',
        scopeType,
        this.id,
        request.user.id,
        this.stallionUuid,
        request.user.roleId,
      );

      console.log(':: STALLATION GAURD ARE :::', rules);
      /**
       * As we have already passed unique apiid to get the api scope details
       * but added additional check here also
       */
      accessData = rules.filter((ele) => {
        return ele.ApiId === this.id;
      });
      console.log('::: ACCESS DATA DETAILS ARE ::', accessData);
      if (accessData === null || accessData.length === 0) {
        console.log(':: Authorize Exception :::');
        throw new ForbiddenException('You do not have sufficient privileges');
      }
    } catch (error) {
      console.log('::::Exception Inside validateRole:::');
      throw error;
    }
  }
}
