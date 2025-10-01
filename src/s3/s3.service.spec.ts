import { Test, TestingModule } from '@nestjs/testing';
import { s3 } from './s3.service';

describe('SpacesService', () => {
  let service: s3;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [s3],
    }).compile();

    service = module.get<s3>(s3);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
