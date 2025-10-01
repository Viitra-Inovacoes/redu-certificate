import { UploadedFiles } from '@nestjs/common';
import { FileValidationFactory } from 'src/validators/file-validation.factory';

export type TemplateFiles = {
  frontBackground: Express.Multer.File;
  backBackground: Express.Multer.File;
};

export const TemplateFiles = () => {
  return UploadedFiles(
    FileValidationFactory.createValidationPipe({
      fileIsRequired: true,
      maxSize: FileValidationFactory.toBytes(10, 'mb'),
      fileType: 'image/*',
    }),
  );
};
