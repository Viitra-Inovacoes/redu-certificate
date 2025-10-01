import { BadRequestException } from '@nestjs/common';
import { plainToInstance, Transform } from 'class-transformer';

export function TransformJson<T>(dto: new () => T) {
  return Transform(({ value }): T => {
    if (typeof value !== 'string') return value;

    try {
      const parsed = JSON.parse(value) as T;
      return plainToInstance(dto, parsed, {
        enableImplicitConversion: true,
      });
    } catch (error) {
      const message = `Invalid JSON format for ${dto.name}: ${(error as Error).message}`;
      throw new BadRequestException(message);
    }
  });
}
