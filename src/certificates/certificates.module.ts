import { Module, forwardRef } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './entities/certificate.entity';
import { SpacesModule } from 'src/s3/s3.module';
import { ReduApiModule } from 'src/redu-api/redu-api.module';
import { RendererService } from './renderer.service';
import { ClientModule } from 'src/client/client.module';
import { CertificateBuilderService } from './certificate-builder.service';
import { TemplatesModule } from 'src/templates/templates.module';
import { RequirementsService } from 'src/certificates/requirements.service';
import { StructuresModule } from 'src/structures/structures.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    SpacesModule,
    ClientModule,
    ReduApiModule,
    UsersModule,
    StructuresModule,
    forwardRef(() => TemplatesModule),
    TypeOrmModule.forFeature([Certificate]),
  ],
  controllers: [CertificatesController],
  providers: [
    CertificatesService,
    CertificateBuilderService,
    RendererService,
    RequirementsService,
  ],
  exports: [CertificateBuilderService, CertificatesService],
})
export class CertificatesModule {}
