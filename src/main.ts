import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ArgumentsHost,
  INestApplication,
  VersioningType,
} from '@nestjs/common';
import {
  I18nValidationPipe,
  I18nValidationExceptionFilter,
  I18nValidationException,
} from 'nestjs-i18n';
import { ValidationError } from 'class-validator';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

function setupVersioning(app: INestApplication) {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
}

function setupCors(app: INestApplication) {
  app.enableCors();
}

function setupValidation(app: INestApplication) {
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false,
      },
      transformOptions: { enableImplicitConversion: true },
    }),
  );
}

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setVersion('1.0')
    .addSecurity('X-Client-Name', {
      type: 'apiKey',
      in: 'header',
      name: 'X-Client-Name',
    })
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, config),
  );
}

function setupI18n(app: INestApplication) {
  function buildErrors(acc: Record<string, unknown>, error: ValidationError) {
    acc[error.property] = formatError(error);
    return acc;
  }

  function formatError({
    constraints = {},
    children = [],
  }: ValidationError): Record<string, unknown> | string | string[] {
    const messages = Object.values(constraints);
    const value = messages.length > 1 ? messages : messages[0];
    if (children.length === 0) return value;

    return { _self: value, ...children.reduce(buildErrors, {}) };
  }

  const responseBodyFormatter = (
    _host: ArgumentsHost,
    exception: I18nValidationException,
  ) => {
    return { errors: exception.errors.reduce(buildErrors, {}) };
  };

  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ responseBodyFormatter }),
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupI18n(app);
  setupVersioning(app);
  setupCors(app);
  setupValidation(app);
  setupSwagger(app);

  // Enable graceful shutdown
  app.enableShutdownHooks();

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
