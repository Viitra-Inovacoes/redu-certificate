import { UseGuards } from '@nestjs/common';
import { Ability } from 'src/redu-api/authorization.service';
import { ManageSignatureGuard } from './manage.guard';

export const SignatureGuard = (action: Ability) => {
  switch (action) {
    case Ability.MANAGE:
      return UseGuards(ManageSignatureGuard);
    default:
      throw new Error(`Invalid action: ${action}`);
  }
};
