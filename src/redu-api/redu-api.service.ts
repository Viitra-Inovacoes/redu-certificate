import { ClientService } from 'src/client/client.service';
import { BadRequestException, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import type { Request } from 'express';
import { i18n } from 'src/i18n';
import { Logger } from 'winston';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectLogger } from 'src/decorators/inject-logger.decorator';

type QueryParams =
  | string[][]
  | Record<string, string>
  | string
  | URLSearchParams;

export class ReduApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReduApiError';
  }
}

const REDU_API_CACHE_TTL = 60 * 1000; // 1 minute

@Injectable({ scope: Scope.REQUEST })
export class ReduApiService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly client: ClientService,
    @InjectLogger() private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async get<T>(url: string, options?: RequestInit) {
    const cacheKey = this.requestCacheKey(url);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug('get', {
        context: 'ReduApiService',
        isCached: true,
        url,
        options,
      });
      return cached as T;
    }

    this.logger.debug('get', {
      context: 'ReduApiService',
      isCached: false,
      url,
      options,
    });
    const response = await fetch(url, {
      ...options,
      method: 'GET',
      headers: {
        ...options?.headers,
        Authorization: this.getAuthorizationToken(),
        AppKey: this.client.appKey,
      },
    });

    if (!response.ok) throw new ReduApiError(await response.text());
    const data = await this.toJson<T>(response);
    await this.cache.set(cacheKey, data, REDU_API_CACHE_TTL);
    return data;
  }

  buildUrl(path: string, queryParams?: QueryParams): string {
    const url = new URL(this.client.baseUrl);
    url.pathname += path;
    if (queryParams) {
      url.search = new URLSearchParams(queryParams).toString();
    }
    return url.toString();
  }

  private async toJson<T>(response: Response): Promise<T> {
    const body = await response.text();
    try {
      const json = JSON.parse(body) as T;
      return this.camelizeKeys(json);
    } catch {
      return body as T;
    }
  }

  private camelizeKeys<T>(object: T): T {
    if (Array.isArray(object)) {
      return object.map((item: T) => this.camelizeKeys(item)) as T;
    }

    if (object !== null && typeof object === 'object') {
      return Object.fromEntries(
        Object.entries(object).map(([key, val]) => [
          this.camelize(key),
          this.camelizeKeys(val),
        ]),
      ) as T;
    }

    return object;
  }

  private camelize(str: string): string {
    return str.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
  }

  private getAuthorizationToken(): string {
    const authorization = this.request.headers['authorization'];
    if (!authorization)
      throw new BadRequestException(
        i18n.t('error.AUTHORIZATION_HEADER_REQUIRED'),
      );

    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer' || !token)
      throw new BadRequestException(
        i18n.t('error.INVALID_AUTHORIZATION_HEADER'),
      );

    return token;
  }

  private requestCacheKey(url: string): string {
    const authorizationToken = this.getAuthorizationToken();
    const clientName = this.client.clientName;
    return `${clientName}:${authorizationToken}:${url}`;
  }
}
