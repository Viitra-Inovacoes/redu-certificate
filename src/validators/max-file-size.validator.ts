import { IFile } from '@nestjs/common/pipes/file/interfaces';
import { MaxFileSizeValidator as DefaultMaxFileSizeValidator } from '@nestjs/common';

type FileObject = Record<string, IFile>;

export class MaxFileSizeValidator extends DefaultMaxFileSizeValidator {
  isValid(value: unknown): boolean {
    if (!value) return true;
    if (this.isObject(value)) return this.validateObject(value as FileObject);
    if (Array.isArray(value)) return this.validateArray(value as IFile[]);
    return super.isValid(value as IFile);
  }

  private isObject(value: unknown): boolean {
    return typeof value === 'object' && !('buffer' in value!);
  }

  private validateObject(files: FileObject): boolean {
    return Object.values(files)
      .map((file) => this.isValid(file))
      .every((isValid) => isValid);
  }

  private validateArray(files: IFile[]): boolean {
    return files.map((file) => super.isValid(file)).every((isValid) => isValid);
  }
}
