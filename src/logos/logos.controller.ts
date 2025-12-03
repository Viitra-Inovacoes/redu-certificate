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

  @Delete('logos/:id')
  remove(@Param('id') id: string) {
    return this.logosService.remove(id);
  }
}
