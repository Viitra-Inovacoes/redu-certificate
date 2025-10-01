import {
  FileTypeValidatorOptions,
  FileValidator,
  MaxFileSizeValidatorOptions,
  ParseFilePipe,
} from '@nestjs/common';
import { FileTypeValidator } from './file-type.validator';
import { MaxFileSizeValidator } from './max-file-size.validator';

export type FileValidationOptions = Partial<
  MaxFileSizeValidatorOptions & FileTypeValidatorOptions
> & {
  fileIsRequired?: boolean;
};

export class FileValidationFactory {
  static createValidationPipe(options: FileValidationOptions): ParseFilePipe {
    const { maxSize, fileType, fileIsRequired } = options;
    const validators: FileValidator[] = [];

    if (maxSize) {
      validators.push(
        new MaxFileSizeValidator(options as MaxFileSizeValidatorOptions),
      );
    }

    if (fileType) {
      validators.push(
        new FileTypeValidator(options as FileTypeValidatorOptions),
      );
    }

    return new ParseFilePipe({ fileIsRequired, validators });
  }

  static toBytes(size: number, unit: 'kb' | 'mb' | 'gb' = 'mb') {
    switch (unit) {
      case 'kb':
        return size * 1024;
      case 'mb':
        return size * 1024 * 1024;
      case 'gb':
        return size * 1024 * 1024 * 1024;
    }
  }
}
