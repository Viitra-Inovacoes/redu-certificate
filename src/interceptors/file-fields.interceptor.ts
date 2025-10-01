import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileFieldsInterceptor as DefaultFileFieldsInterceptor } from '@nestjs/platform-express';
import {
  MulterField,
  MulterOptions,
} from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

type File = Express.Multer.File;

interface Files {
  [key: string]: File[];
}

interface RequestWithFiles {
  files?: Record<string, File | File[]>;
}

export function FileFieldsInterceptor(
  fields: MulterField[],
  options?: MulterOptions,
) {
  const fileFieldsInterceptor = DefaultFileFieldsInterceptor(fields, options);

  @Injectable()
  class FileFieldsSingleInterceptorClass implements NestInterceptor {
    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const originalInterceptor = new fileFieldsInterceptor();
      await originalInterceptor.intercept(context, next);

      const request = context.switchToHttp().getRequest<Files>();
      if (request.files) {
        const files = request.files;
        const transformedFiles: Record<string, File | File[]> = {};
        for (const field of fields) {
          const fieldName = field.name;
          if (
            files[fieldName] &&
            Array.isArray(files[fieldName]) &&
            field.maxCount == 1
          ) {
            transformedFiles[fieldName] = files[fieldName][0] as File;
          } else {
            transformedFiles[fieldName] = files[fieldName] as File[];
          }
        }
        (request as RequestWithFiles).files = transformedFiles;
      }

      return next.handle();
    }
  }

  return FileFieldsSingleInterceptorClass;
}
