import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

export function InjectLogger() {
  return Inject(WINSTON_MODULE_PROVIDER);
}
