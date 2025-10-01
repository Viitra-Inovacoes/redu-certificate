import { Test, TestingModule } from '@nestjs/testing';
import { BlueprintsService } from './blueprints.service';
import { BlueprintFiles } from 'src/blueprints/blueprint-files.interface';
import { S3Service } from 'src/s3/s3.service';
import { Blueprint } from 'src/blueprints/entities/blueprint.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v7 as uuidv7 } from 'src/__mocks__/uuid';

describe('BlueprintsService', () => {
  let service: BlueprintsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlueprintsService,
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue({}),
            deleteFiles: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(Blueprint),
          useValue: {
            create: jest.fn().mockResolvedValue({ id: uuidv7() }),
            save: jest.fn().mockResolvedValue({ id: uuidv7(), saved: true }),
          },
        },
      ],
    }).compile();

    service = module.get<BlueprintsService>(BlueprintsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a blueprint', async () => {
      const files: BlueprintFiles = {
        front: {
          fieldname: 'front',
          mimetype: 'text/html',
          size: 1024,
          buffer: Buffer.from('<html>Front</html>'),
        } as Express.Multer.File,
        backSmall: {
          fieldname: 'backSmall',
          mimetype: 'text/html',
          size: 1024,
          buffer: Buffer.from('<html>Back Small</html>'),
        } as Express.Multer.File,
        backLarge: {
          fieldname: 'backLarge',
          mimetype: 'text/html',
          size: 1024,
          buffer: Buffer.from('<html>Back Large</html>'),
        } as Express.Multer.File,
        frontBackground: {
          fieldname: 'frontBackground',
          mimetype: 'image/png',
          size: 1024,
          buffer: Buffer.from('<html>Front Background</html>'),
        } as Express.Multer.File,
        backBackground: {
          fieldname: 'backBackground',
          mimetype: 'image/png',
          size: 1024,
          buffer: Buffer.from('<html>Back Background</html>'),
        } as Express.Multer.File,
      };

      const body = {
        name: 'Test Blueprint',
      };

      const blueprint = await service.create(files, body);
      expect(blueprint).toHaveProperty('id');
    });
  });
});
