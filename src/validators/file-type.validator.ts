import { IFile } from '@nestjs/common/pipes/file/interfaces';
import { FileTypeValidator as DefaultFileTypeValidator } from '@nestjs/common';

type FileObject = Record<string, IFile>;

export class FileTypeValidator extends DefaultFileTypeValidator {
  async isValid(value: unknown): Promise<boolean> {
    if (!value) return true;
    if (this.isObject(value)) return this.validateObject(value as FileObject);
    if (Array.isArray(value)) return this.validateArray(value as IFile[]);
    return super.isValid(value as IFile);
  }

  private isObject(value: unknown): boolean {
    return typeof value === 'object' && !('buffer' in value!);
  }

  private async validateObject(files: FileObject): Promise<boolean> {
    const results = await Promise.all(
      Object.values(files).map((file) => this.isValid(file)),
    );
    return results.every((isValid) => isValid);
  }

  private async validateArray(files: IFile[]): Promise<boolean> {
    const results = await Promise.all(files.map((file) => super.isValid(file)));
    return results.every((isValid) => isValid);
  }
}
