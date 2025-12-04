import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { i18n } from 'src/i18n';
@Injectable()
export class EnumParamValidationPipe implements PipeTransform {
  constructor(private readonly enumType: Record<string, string>) {}

  transform(value: string, _metadata: ArgumentMetadata) {
    const enumValues = Object.values(this.enumType);

    if (!enumValues.includes(value)) {
      throw new BadRequestException(
        i18n.t('validation.ENUM', {
          args: {
            field: _metadata.data,
            values: enumValues.join(', '),
          },
        }),
      );
    }
    return value;
  }
}
