import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
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
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import * as path from 'path';
import { RequestLoggerMiddleware } from 'src/logger/request-logger.middleware';

const transportOptions = {
  maxsize: 10 * 1024 * 1024,
  maxFiles: 10,
  tailable: true,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
};

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    I18nModule.forRoot({
      fallbackLanguage: 'pt',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['x-lang'])],
      typesOutputPath: path.join(__dirname, 'generated/i18n.generated.ts'),
    }),
    WinstonModule.forRoot({
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
      ),
      transports: [
        new transports.File({
          filename: 'logs/error.jsonl',
          level: 'error',
          handleExceptions: true,
          handleRejections: true,

          ...transportOptions,
        }),
        new transports.File({
          filename: 'logs/info.jsonl',
          level: 'info',
          ...transportOptions,
        }),
        new transports.File({
          filename: 'logs/debug.jsonl',
          level: 'debug',
          ...transportOptions,
        }),
      ],
    }),
    SignaturesModule,
    LogosModule,
    TemplatesModule,
    SpacesModule,
    BlueprintsModule,
    CertificatesModule,
    ReduApiModule,
    ClientModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
