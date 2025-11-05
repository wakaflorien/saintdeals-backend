import { Test, TestingModule } from '@nestjs/testing';
import { BrandService } from './brand.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { ErrorHandlerService } from '../common/error-handler.service';

describe('BrandService', () => {
  let service: BrandService;

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
  };

  const mockErrorHandlerService = {
    handleError: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
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

    service = module.get<BrandService>(BrandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
