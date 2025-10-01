import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import {
  Ability,
  ReduAuthorizationService,
  Model,
} from 'src/redu-api/authorization.service';

@Injectable()
export class ManageBlueprintGuard implements CanActivate {
  constructor(
    private readonly authorizationService: ReduAuthorizationService,
  ) {}

  async canActivate(_context: ExecutionContext): Promise<boolean> {
    await this.authorizationService.authorize({
      abilityAction: Ability.MANAGE,
      model: Model.ALL,
    });

    return true;
  }
}
