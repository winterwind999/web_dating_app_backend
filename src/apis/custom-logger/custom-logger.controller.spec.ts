import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerController } from './custom-logger.controller';
import { CustomLoggerService } from './custom-logger.service';

describe('CustomLoggerController', () => {
  let controller: CustomLoggerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomLoggerController],
      providers: [CustomLoggerService],
    }).compile();

    controller = module.get<CustomLoggerController>(CustomLoggerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
