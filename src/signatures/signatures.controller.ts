import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SignaturesService } from './signatures.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { SignatureSchema } from './dto/signature-schema';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationFactory } from 'src/validators/file-validation.factory';

@Controller('signatures')
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SignatureSchema })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() body: CreateSignatureDto,
    @UploadedFile(
      FileValidationFactory.createValidationPipe({
        fileIsRequired: true,
        maxSize: FileValidationFactory.toBytes(10, 'mb'),
        fileType: 'image/*',
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.signaturesService.create(body, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.signaturesService.remove(id);
  }
}
