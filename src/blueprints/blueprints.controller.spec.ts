import { Test, TestingModule } from '@nestjs/testing';
import { BlueprintsController } from './blueprints.controller';
import { BlueprintsService } from './blueprints.service';

describe('BlueprintsController', () => {
  let controller: BlueprintsController;

  const mockBlueprintsService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlueprintsController],
      providers: [
        {
          provide: BlueprintsService,
          useValue: mockBlueprintsService,
        },
      ],
    }).compile();

    controller = module.get<BlueprintsController>(BlueprintsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
