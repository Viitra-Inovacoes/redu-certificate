import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ReduAuthorizationService } from './authorization.service';

async function initServiceWithHeaders(headers: Record<string, string>) {
  return Test.createTestingModule({
    providers: [
      ReduAuthorizationService,
      {
        provide: REQUEST,
        useValue: {
          headers,
        },
      },
    ],
  })
    .compile()
    .then((m: TestingModule) =>
      m.resolve<ReduAuthorizationService>(ReduAuthorizationService),
    )
    .catch(() => undefined);
}

describe('AuthorizationService', () => {
  let service: ReduAuthorizationService;

  describe('Com X-Client-Name invalido', () => {
    beforeEach(async () => {
      service = (await initServiceWithHeaders({
        'x-client-name': 'invalid-client',
        authorization: '123',
      })) as ReduAuthorizationService;
    });

    it('should not be defined', () => {
      expect(service).toBeUndefined();
    });
  });

  describe('Com X-Client-Name invalido', () => {
    beforeEach(async () => {
      service = (await initServiceWithHeaders({
        'x-client-name': 'redu',
        authorization: '123',
      })) as ReduAuthorizationService;
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
