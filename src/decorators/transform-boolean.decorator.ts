// https://github.com/typestack/class-transformer/issues/550#issuecomment-2828321035

import { Transform, TransformFnParams, Type } from 'class-transformer';

export function TransformBoolean(): PropertyDecorator {
  // Creates both `@Type` and `@Transform` decorators
  const typeDecorator = Type(() => String);
  const transformDecorator = Transform(
    (transformParams: TransformFnParams): boolean => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return transformParams.value.toLowerCase() === 'true';
    },
  );

  return function ToBooleanTransform(
    target: any,
    propertyName: string | symbol,
  ): void {
    // When my decorator runs, first runs Type (so we go back to string),
    // then Transform (So we properly convert it)
    typeDecorator(target, propertyName);
    transformDecorator(target, propertyName);
  };
}
