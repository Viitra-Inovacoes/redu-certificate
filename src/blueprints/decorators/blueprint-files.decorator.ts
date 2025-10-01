import { UploadedFiles } from '@nestjs/common';
import { FileValidationFactory } from 'src/validators/file-validation.factory';

export type BlueprintFiles = {
  front: Express.Multer.File;
  backSmall: Express.Multer.File;
  backLarge: Express.Multer.File;
  frontBackground: Express.Multer.File;
  backBackground: Express.Multer.File;
};

export const BlueprintFiles = () => {
  return UploadedFiles(
    FileValidationFactory.createValidationPipe({
      fileIsRequired: true,
      maxSize: FileValidationFactory.toBytes(10, 'mb'),
    }),
  );
};
