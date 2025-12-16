import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createReview: jest.fn(),
    findAllReviews: jest.fn(),
    findOneReview: jest.fn(),
    updateReview: jest.fn(),
    removeReview: jest.fn(),
    addToWishlist: jest.fn(),
    findAllWishlistItems: jest.fn(),
    removeFromWishlist: jest.fn(),
    checkWishlistStatus: jest.fn(),
    getFeaturedProducts: jest.fn(),
    getProductStats: jest.fn(),
    searchProducts: jest.fn(),
    getRelatedProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        basePrice: 100,
        categoryId: 1,
        brandId: 1,
      };

      const expectedResult = { id: 1, ...createDto };
      mockProductService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto as any);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const expectedResult = {
        data: [{ id: 1, name: 'Product 1' }],
        pagination: { page: 1, limit: 10, totalPages: 1, totalCount: 1 },
      };

      mockProductService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll({});

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const expectedResult = { id: 1, name: 'Test Product' };
      mockProductService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = { name: 'Updated Product' };
      const expectedResult = { id: 1, ...updateDto };

      mockProductService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDto as any);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const expectedResult = { message: 'Product deleted successfully' };
      mockProductService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(1);

      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('createReview', () => {
    it('should create a review', async () => {
      const createReviewDto = {
        userId: 1,
        productId: 1,
        rating: 5,
        title: 'Great!',
        comment: 'Excellent product',
        isVerified: false,
      };

      const expectedResult = { id: 1, ...createReviewDto };
      mockProductService.createReview.mockResolvedValue(expectedResult);

      const result = await controller.createReview(createReviewDto);

      expect(result).toEqual(expectedResult);
      expect(service.createReview).toHaveBeenCalledWith(createReviewDto);
    });
  });

  describe('addToWishlist', () => {
    it('should add product to wishlist', async () => {
      const createWishlistDto = {
        userId: 1,
        productId: 1,
      };

      const expectedResult = { id: 1, ...createWishlistDto };
      mockProductService.addToWishlist.mockResolvedValue(expectedResult);

      const result = await controller.addToWishlist(createWishlistDto);

      expect(result).toEqual(expectedResult);
      expect(service.addToWishlist).toHaveBeenCalledWith(createWishlistDto);
    });
  });

  describe('getFeatured', () => {
    it('should return featured products', async () => {
      const expectedResult = [{ id: 1, name: 'Featured Product' }];
      mockProductService.getFeaturedProducts.mockResolvedValue(expectedResult);

      const result = await controller.getFeatured(8);

      expect(result).toEqual(expectedResult);
      expect(service.getFeaturedProducts).toHaveBeenCalledWith(8);
    });
  });

  describe('search', () => {
    it('should search products', async () => {
      const expectedResult = [{ id: 1, name: 'Search Result' }];
      mockProductService.searchProducts.mockResolvedValue(expectedResult);

      const result = await controller.search('test', 10);

      expect(result).toEqual(expectedResult);
      expect(service.searchProducts).toHaveBeenCalledWith('test', 10);
    });
  });
});
