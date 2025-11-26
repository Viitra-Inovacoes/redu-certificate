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
import { ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationFactory } from 'src/validators/file-validation.factory';
import { SignatureResponseDto } from 'src/signatures/dto/signature-response.dto';

@Controller('signatures')
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SignatureSchema })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ type: SignatureResponseDto })
  async create(
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
    const signature = await this.signaturesService.create(body, file);
    return this.signaturesService.serialize(signature);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.signaturesService.remove(id);
  }
}
