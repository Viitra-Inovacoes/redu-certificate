import { Module } from '@nestjs/common';
import { TemplatesModule } from './templates/templates.module';
import { SpacesModule } from './s3/s3.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { BlueprintsModule } from './blueprints/blueprints.module';
import { CertificatesModule } from './certificates/certificates.module';
import { SignaturesModule } from './signatures/signatures.module';
import { LogosModule } from './logos/logos.module';
import { ReduApiModule } from './redu-api/redu-api.module';
import { ClientModule } from './client/client.module';
import { dataSourceOptions } from './data-source';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      migrationsRun: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'pt',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['x-lang'])],
      typesOutputPath: path.join(__dirname, 'generated/i18n.generated.ts'),
    }),
    TemplatesModule,
    SpacesModule,
    BlueprintsModule,
    CertificatesModule,
    SignaturesModule,
    LogosModule,
    ReduApiModule,
    ClientModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
