import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';

export const ApiAuth = () => {
  return applyDecorators(ApiSecurity('X-Client-Name'), ApiBearerAuth());
};
