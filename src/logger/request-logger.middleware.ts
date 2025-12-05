import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { InjectLogger } from 'src/decorators/inject-logger.decorator';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(@InjectLogger() private readonly logger: Logger) {}

  use(req: Request, res: Response, next: () => void) {
    const method: string = req.method ?? 'UNKNOWN';
    const url: string = req.originalUrl ?? 'UNKNOWN';
    const startTime = Date.now();
    const requestId: string = uuidv4();
    req.headers['x-request-id'] = requestId;

    const originalSend = res.send.bind(res) as Response['send'];
    res.send = (body?: unknown): Response => {
      const durationMs = Date.now() - startTime;
      const durationSeconds = (durationMs / 1000).toFixed(3);
      this.logger.info('response', {
        context: 'LoggerMiddleware',
        method,
        url,
        statusCode: res.statusCode,
        requestId,
        duration: durationMs > 1000 ? `${durationSeconds}s` : `${durationMs}ms`,
      });

      this.logger.debug('response body', {
        context: 'LoggerMiddleware',
        requestId,
        body,
      });

      return originalSend(body);
    };

    this.logger.info('request', {
      context: 'LoggerMiddleware',
      method,
      url,
      body: (req.body ?? {}) as unknown,
      requestId,
    });
    this.logger.debug('request headers', {
      context: 'LoggerMiddleware',
      headers: {
        'x-request-id': requestId,
        'x-client-name': req.headers['x-client-name'],
        authorization: req.headers['authorization'],
      },
    });
    next();
  }
}
