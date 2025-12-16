import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    brand: {
      findUnique: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    wishlist: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    productVariant: {
      aggregate: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  };

  const mockErrorHandlerService = {
    handleError: jest.fn((error) => {
      throw error;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
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

    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createProductDto = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        basePrice: 100,
        categoryId: 1,
        brandId: 1,
      };

      const mockCategory = { id: 1, name: 'Test Category' };
      const mockBrand = { id: 1, name: 'Test Brand' };
      const mockProduct = { id: 1, ...createProductDto };

      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.brand.findUnique.mockResolvedValue(mockBrand);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto as any);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if slug already exists', async () => {
      const createProductDto = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        basePrice: 100,
        categoryId: 1,
        brandId: 1,
      };

      mockPrismaService.product.findUnique.mockResolvedValue({
        id: 1,
        slug: 'test-product',
      });

      await expect(service.create(createProductDto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.data).toEqual(mockProducts);
      expect(result.pagination.totalCount).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct = { id: 1, name: 'Test Product' };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
      });

      const result = await service.findOne(1);

      expect(result).toHaveProperty('averageRating');
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const updateDto = { name: 'Updated Product' };
      const existingProduct = { id: 1, name: 'Old Name', slug: 'old-slug' };
      const updatedProduct = { id: 1, ...updateDto };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateDto as any);

      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a product successfully', async () => {
      const mockProduct = { id: 1, name: 'Test Product' };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove(1);

      expect(result).toHaveProperty('message');
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      const createReviewDto = {
        userId: 1,
        productId: 1,
        rating: 5,
        title: 'Great!',
        comment: 'Excellent product',
        isVerified: false,
      };

      const mockUser = { id: 1, email: 'test@test.com' };
      const mockProduct = { id: 1, name: 'Test Product' };
      const mockReview = { id: 1, ...createReviewDto };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.review.findUnique.mockResolvedValue(null);
      mockPrismaService.review.create.mockResolvedValue(mockReview);

      const result = await service.createReview(createReviewDto);

      expect(result).toEqual(mockReview);
      expect(mockPrismaService.review.create).toHaveBeenCalled();
    });
  });

  describe('addToWishlist', () => {
    it('should add product to wishlist successfully', async () => {
      const createWishlistDto = {
        userId: 1,
        productId: 1,
      };

      const mockUser = { id: 1, email: 'test@test.com' };
      const mockProduct = { id: 1, name: 'Test Product' };
      const mockWishlistItem = { id: 1, ...createWishlistDto };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.wishlist.findUnique.mockResolvedValue(null);
      mockPrismaService.wishlist.create.mockResolvedValue(mockWishlistItem);

      const result = await service.addToWishlist(createWishlistDto);

      expect(result).toEqual(mockWishlistItem);
      expect(mockPrismaService.wishlist.create).toHaveBeenCalled();
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return featured products', async () => {
      const mockProducts = [{ id: 1, name: 'Featured Product' }];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
      });

      const result = await service.getFeaturedProducts(8);

      expect(result).toHaveLength(1);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isFeatured: true }),
        }),
      );
    });
  });
});
