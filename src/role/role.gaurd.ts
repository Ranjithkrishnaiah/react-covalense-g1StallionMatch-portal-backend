import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  public methodName;
  public id;
  public farmUuid;
  constructor(public roleService: RoleService, public reflector: Reflector) {
    console.log('::: ROLE GAURD INITIALISED :::');
  }
  async canActivate(context: ExecutionContext): Promise<any> {
    let allow = true;
    try {
      const request = context.switchToHttp().getRequest();
      console.log('::::Inside canActivate:::');
      const apiDetails = this.reflector.get<any>('api', context.getHandler());
      console.log('::::apiDetails:::', apiDetails);
      this.methodName = apiDetails.method;
      this.id = apiDetails.id;
      if (
        apiDetails.farmIdIn !== undefined &&
        apiDetails.farmIdIn === 'params'
      ) {
        let key = apiDetails['farmKey'];
        console.log('::: KEY IS ::::::::', key);
        this.farmUuid = request.params[key];
      }
      if (apiDetails.farmIdIn !== undefined && apiDetails.farmIdIn === 'body') {
        let key = apiDetails['farmKey'];
        console.log('::: KEY IS ::::::REQ BODY::', key, request.body);
        this.farmUuid = request.body[key];
      }
      if (
        apiDetails.farmIdIn !== undefined &&
        apiDetails.farmIdIn === 'query'
      ) {
        let key = apiDetails['farmKey'];
        console.log('::: KEY IS ::::::::', key);
        this.farmUuid = request.query[key];
      }
      await this.validateRole(request);
      console.log(
        ':::::ROLE GAURD REQUEST DETAILS ARE::::::::::::::::::::::::::::::: :::',
      );
    } catch (error) {
      console.log(':::Error::in::canActivate', error);
      allow = false;
      throw error;
    }

    return allow;
  }
  public async validateRole(request: any) {
    console.log('::::INSIDE VALIDATE ROLE ::::');
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
      console.log(':: LOGGED IN USER TOKEN IS ::', request.user);
      let rules: any = await this.roleService.findScopes(
        scopeType,
        this.id,
        request.user.id,
        this.farmUuid || null,
        request.user.roleId,
      );
      console.log(
        '::  SCOPE DETAILS ARE ::: ::',
        scopeType,
        this.id,
        request.user.id,
        this.farmUuid,
        request.user.roleId,
      );

      console.log(':: RULES ARE :::', rules);
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
