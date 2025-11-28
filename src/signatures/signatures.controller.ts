import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SignaturesService } from './signatures.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { UpdateSignatureDto } from './dto/update-signature.dto';
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

  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SignatureSchema })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ type: SignatureResponseDto })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSignatureDto,
    @UploadedFile(
      FileValidationFactory.createValidationPipe({
        fileIsRequired: false,
        maxSize: FileValidationFactory.toBytes(10, 'mb'),
        fileType: 'image/*',
      }),
    )
    file: Express.Multer.File,
  ) {
    const signature = await this.signaturesService.update(id, body, file);
    return this.signaturesService.serialize(signature);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.signaturesService.remove(id);
  }
}
