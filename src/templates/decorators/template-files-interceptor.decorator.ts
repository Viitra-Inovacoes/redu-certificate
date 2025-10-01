import { UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from 'src/interceptors/file-fields.interceptor';

export const TemplateFilesInterceptor = () => {
  return UseInterceptors(
    FileFieldsInterceptor([
      { name: 'frontBackground', maxCount: 1 },
      { name: 'backBackground', maxCount: 1 },
    ]),
  );
};
