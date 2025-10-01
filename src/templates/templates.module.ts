import { Module, forwardRef } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { SpacesModule } from 'src/s3/s3.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from 'src/templates/entities/template.entity';
import { ReduApiModule } from 'src/redu-api/redu-api.module';
import { ClientModule } from 'src/client/client.module';
import { CertificatesModule } from 'src/certificates/certificates.module';
import { PreviewService } from 'src/templates/preview.service';
import { StructuresModule } from 'src/structures/structures.module';
import { LogosModule } from 'src/logos/logos.module';
import { SignaturesModule } from 'src/signatures/signatures.module';

@Module({
  imports: [
    forwardRef(() => CertificatesModule),
    ClientModule,
    ReduApiModule,
    SpacesModule,
    StructuresModule,
    LogosModule,
    SignaturesModule,
    TypeOrmModule.forFeature([Template]),
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService, PreviewService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
