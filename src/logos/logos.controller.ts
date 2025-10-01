import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LogosService } from './logos.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { LogoSchema } from './dto/logo-schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileValidationFactory } from 'src/validators/file-validation.factory';
@Controller('logos')
export class LogosController {
  constructor(private readonly logosService: LogosService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: LogoSchema })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() body: CreateLogoDto,
    @UploadedFile(
      FileValidationFactory.createValidationPipe({
        fileIsRequired: true,
        maxSize: FileValidationFactory.toBytes(10, 'mb'),
        fileType: 'image/*',
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.logosService.create(body, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logosService.remove(id);
  }
}
