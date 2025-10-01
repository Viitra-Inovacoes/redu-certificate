import { UseGuards } from '@nestjs/common';
import { Ability } from 'src/redu-api/authorization.service';
import { ManageTemplateGuard } from 'src/templates/guards/manage.guard';
import { ReadTemplateGuard } from 'src/templates/guards/read.guard';

export const TemplateGuard = (action: Ability) => {
  switch (action) {
    case Ability.READ:
      return UseGuards(ReadTemplateGuard);
    case Ability.MANAGE:
      return UseGuards(ManageTemplateGuard);
    default:
      throw new Error(`Invalid action: ${action}`);
  }
};
