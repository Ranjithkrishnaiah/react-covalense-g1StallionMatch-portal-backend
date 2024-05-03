import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FarmMemberPolicyService } from './policies/farm.memberpolicy.service';

@Injectable()
export class FormPolicyValidationGaurd implements CanActivate {
  private methodName;
  private id;
  constructor(
    private reflector: Reflector,
    @Inject(FarmMemberPolicyService)
    private readonly farmMemberPolicy: FarmMemberPolicyService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    let allow = true;
    try {
      await this.checkPolicy(context);
    } catch (error) {
      console.log(':::Error::in::canActivate', error);
      allow = false;
      throw error;
    }

    return allow;
  }
  async checkPolicy(context: ExecutionContext): Promise<any> {
    try {
      if (this.id === 'GET_FARM_MEMBERS') {
        await this.farmMemberPolicy.validate(context);
      }
    } catch (error) {
      throw error;
    }
  }
}
