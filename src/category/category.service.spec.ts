import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { ErrorHandlerService } from '../common/error-handler.service';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
  };

  const mockErrorHandlerService = {
    handleError: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
        {
          provide: ErrorHandlerService,
          useValue: mockErrorHandlerService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
