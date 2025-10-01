import { UseGuards } from '@nestjs/common';
import { ManageBlueprintGuard } from 'src/blueprints/guards/manage.guard';
import { Ability } from 'src/redu-api/authorization.service';

export const BlueprintGuard = (action: Ability) => {
  switch (action) {
    case Ability.MANAGE:
      return UseGuards(ManageBlueprintGuard);
    default:
      throw new Error(`Invalid action: ${action}`);
  }
};
