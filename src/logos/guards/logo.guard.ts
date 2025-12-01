import { UseGuards } from '@nestjs/common';
import { Ability } from 'src/redu-api/authorization.service';
import { ManageLogoGuard } from './manage.guard';

export const LogoGuard = (action: Ability) => {
  switch (action) {
    case Ability.MANAGE:
      return UseGuards(ManageLogoGuard);
    default:
      throw new Error(`Invalid action: ${action}`);
  }
};
