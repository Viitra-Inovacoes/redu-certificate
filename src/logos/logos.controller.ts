import {
  Controller,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Post,
} from '@nestjs/common';
import { LogosService } from './logos.service';
import { FileValidationFactory } from 'src/validators/file-validation.factory';
import { LogoGuard } from 'src/logos/guards/logo.guard';
import { Ability } from 'src/redu-api/authorization.service';
import { LogoResponseDto } from 'src/logos/dto/logo-response.dto';
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogoSchema } from 'src/logos/dto/logo-schema';

@Controller()
export class LogosController {
  constructor(private readonly logosService: LogosService) {}

  @Post('templates/:templateId/logos')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: LogoSchema })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ type: LogoResponseDto })
  @LogoGuard(Ability.MANAGE)
  async createLogo(
    @Param('templateId') templateId: string,
    @UploadedFile(
      FileValidationFactory.createValidationPipe({
        fileIsRequired: true,
        maxSize: FileValidationFactory.toBytes(10, 'mb'),
        fileType: 'image/*',
      }),
    )
    file: Express.Multer.File,
  ) {
    const logo = await this.logosService.create(templateId, file);
    return this.logosService.serialize(logo);
  }

  @Delete('logos/:id')
  remove(@Param('id') id: string) {
    return this.logosService.remove(id);
  }
}
