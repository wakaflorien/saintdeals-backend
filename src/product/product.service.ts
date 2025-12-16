import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { ErrorHandlerService } from 'src/common/error-handler.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { QueryWishlistDto } from './dto/query-wishlist.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    imageFiles?: Express.Multer.File[],
  ) {
    try {
      const { variants, images, ...productData } = createProductDto;

      // Check if slug is unique
      const existingProduct = await this.prisma.product.findUnique({
        where: { slug: productData.slug },
      });

      if (existingProduct) {
        throw new ConflictException(
          `Product with slug '${productData.slug}' already exists`,
        );
      }

      // Check if category and brand exist
      const [category, brand] = await Promise.all([
        this.prisma.category.findUnique({
          where: { id: productData.categoryId },
        }),
        this.prisma.brand.findUnique({ where: { id: productData.brandId } }),
      ]);

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${productData.categoryId} not found`,
        );
      }

      if (!brand) {
        throw new NotFoundException(
          `Brand with ID ${productData.brandId} not found`,
        );
      }

      // Upload images to Cloudinary if provided
      const uploadedImages: Array<{
        url: string;
        alt: string;
        isPrimary: boolean;
        order: number;
      }> = [];

      if (imageFiles && imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file, index) => {
          const imageUrl = await this.cloudinaryService.uploadImage(file);
          return {
            url: imageUrl,
            alt: `${productData.name} - Image ${index + 1}`,
            isPrimary: index === 0, // First image is primary
            order: index,
          };
        });
        uploadedImages.push(...(await Promise.all(uploadPromises)));
      }

      // Merge uploaded images with any provided image URLs
      const allImages = [...uploadedImages, ...(images || [])];

      // Create product with variants and images
      const product = await this.prisma.product.create({
        data: {
          ...productData,
          variants: variants?.length
            ? {
                create: variants.map((variant) => ({
                  ...variant,
                  price: Number(variant.price),
                })),
              }
            : undefined,
          images: allImages?.length
            ? {
                create: allImages,
              }
            : undefined,
        },
        include: {
          category: true,
          brand: true,
          variants: {
            include: {
              size: true,
            },
          },
          images: true,
        },
      });

      return product;
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'creating product' });
    }
  }

  async findAll(queryDto: QueryProductDto = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        categoryId,
        brandId,
        gender,
        minPrice,
        maxPrice,
        isFeatured,
        isActive = true,
      } = queryDto;

      const skip = (page - 1) * limit;
      const orderBy = { [sortBy]: sortOrder };

      const where: any = {
        isActive,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(categoryId && { categoryId }),
        ...(brandId && { brandId }),
        ...(gender && { gender }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...((minPrice !== undefined || maxPrice !== undefined) && {
          basePrice: {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice }),
          },
        }),
      };

      const [products, totalCount] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            category: true,
            brand: true,
            variants: {
              include: {
                size: true,
              },
            },
            images: true,
            _count: {
              select: {
                reviews: true,
                wishlist: true,
              },
            },
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        data: products,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        },
      };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'fetching products' });
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          brand: true,
          variants: {
            include: {
              size: true,
            },
          },
          images: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              reviews: true,
              wishlist: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Calculate average rating
      const avgRating = await this.prisma.review.aggregate({
        where: { productId: id },
        _avg: {
          rating: true,
        },
      });

      return {
        ...product,
        averageRating: avgRating._avg.rating || 0,
      };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'fetching product' });
    }
  }

  async findBySlug(slug: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          brand: true,
          variants: {
            include: {
              size: true,
            },
          },
          images: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              reviews: true,
              wishlist: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with slug '${slug}' not found`);
      }

      // Calculate average rating
      const avgRating = await this.prisma.review.aggregate({
        where: { productId: product.id },
        _avg: {
          rating: true,
        },
      });

      return {
        ...product,
        averageRating: avgRating._avg.rating || 0,
      };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'fetching product by slug',
      });
    }
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    imageFiles?: Express.Multer.File[],
  ) {
    try {
      // Check if product exists
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      const { variants, images, ...productData } = updateProductDto;

      // If slug is being updated, check for uniqueness
      if (productData.slug && productData.slug !== existingProduct.slug) {
        const slugExists = await this.prisma.product.findUnique({
          where: { slug: productData.slug },
        });

        if (slugExists) {
          throw new ConflictException(
            `Product with slug '${productData.slug}' already exists`,
          );
        }
      }

      // Upload new images to Cloudinary if provided
      if (imageFiles && imageFiles.length > 0) {
        const uploadedImages = await Promise.all(
          imageFiles.map(async (file, index) => {
            const imageUrl = await this.cloudinaryService.uploadImage(file);
            return {
              url: imageUrl,
              alt: `${existingProduct.name} - Image ${index + 1}`,
              isPrimary: false, // New images are not primary by default
              order: index + 100, // Offset to avoid conflicts
            };
          }),
        );

        // Add new images to the product
        if (uploadedImages.length > 0) {
          await this.prisma.productImage.createMany({
            data: uploadedImages.map((img) => ({
              ...img,
              productId: id,
            })),
          });
        }
      }

      // Update product
      const product = await this.prisma.product.update({
        where: { id },
        data: productData,
        include: {
          category: true,
          brand: true,
          variants: {
            include: {
              size: true,
            },
          },
          images: true,
        },
      });

      return product;
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'updating product' });
    }
  }

  async remove(id: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.prisma.product.delete({
        where: { id },
      });

      return { message: 'Product deleted successfully' };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'deleting product' });
    }
  }

  // ===== REVIEW MANAGEMENT METHODS =====

  async createReview(createReviewDto: CreateReviewDto) {
    try {
      // Check if user and product exist
      const [user, product] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: createReviewDto.userId } }),
        this.prisma.product.findUnique({
          where: { id: createReviewDto.productId },
        }),
      ]);

      if (!user) {
        throw new NotFoundException(
          `User with ID ${createReviewDto.userId} not found`,
        );
      }

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${createReviewDto.productId} not found`,
        );
      }

      // Check if user already reviewed this product
      const existingReview = await this.prisma.review.findUnique({
        where: {
          userId_productId: {
            userId: createReviewDto.userId,
            productId: createReviewDto.productId,
          },
        },
      });

      if (existingReview) {
        throw new ConflictException('User has already reviewed this product');
      }

      const review = await this.prisma.review.create({
        data: createReviewDto,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      return review;
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'creating review' });
    }
  }

  async findAllReviews(queryDto: QueryReviewDto = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        productId,
        userId,
        rating,
        isVerified,
        search,
      } = queryDto;

      const skip = (page - 1) * limit;
      const orderBy = { [sortBy]: sortOrder };

      const where: any = {
        ...(productId && { productId }),
        ...(userId && { userId }),
        ...(rating && { rating }),
        ...(isVerified !== undefined && { isVerified }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { comment: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [reviews, totalCount] = await Promise.all([
        this.prisma.review.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        }),
        this.prisma.review.count({ where }),
      ]);

      return {
        data: reviews,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        },
      };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'fetching reviews' });
    }
  }

  async findOneReview(id: number) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      return review;
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'fetching review' });
    }
  }

  async updateReview(id: number, updateReviewDto: UpdateReviewDto) {
    try {
      const existingReview = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!existingReview) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      const review = await this.prisma.review.update({
        where: { id },
        data: updateReviewDto,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      return review;
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'updating review' });
    }
  }

  async removeReview(id: number) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      await this.prisma.review.delete({
        where: { id },
      });

      return { message: 'Review deleted successfully' };
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'deleting review' });
    }
  }

  // ===== WISHLIST MANAGEMENT METHODS =====

  async addToWishlist(createWishlistDto: CreateWishlistDto) {
    try {
      // Check if user and product exist
      const [user, product] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: createWishlistDto.userId },
        }),
        this.prisma.product.findUnique({
          where: { id: createWishlistDto.productId },
        }),
      ]);

      if (!user) {
        throw new NotFoundException(
          `User with ID ${createWishlistDto.userId} not found`,
        );
      }

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${createWishlistDto.productId} not found`,
        );
      }

      // Check if already in wishlist
      const existingWishlistItem = await this.prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId: createWishlistDto.userId,
            productId: createWishlistDto.productId,
          },
        },
      });

      if (existingWishlistItem) {
        throw new ConflictException('Product is already in wishlist');
      }

      const wishlistItem = await this.prisma.wishlist.create({
        data: createWishlistDto,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      });

      return wishlistItem;
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'adding product to wishlist',
      });
    }
  }

  async findAllWishlistItems(queryDto: QueryWishlistDto = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        userId,
        productId,
        search,
      } = queryDto;

      const skip = (page - 1) * limit;
      const orderBy = { [sortBy]: sortOrder };

      const where: any = {
        ...(userId && { userId }),
        ...(productId && { productId }),
        ...(search && {
          product: {
            name: { contains: search, mode: 'insensitive' },
          },
        }),
      };

      const [wishlistItems, totalCount] = await Promise.all([
        this.prisma.wishlist.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        }),
        this.prisma.wishlist.count({ where }),
      ]);

      return {
        data: wishlistItems,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        },
      };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'fetching wishlist items',
      });
    }
  }

  async removeFromWishlist(userId: number, productId: number) {
    try {
      const wishlistItem = await this.prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      if (!wishlistItem) {
        throw new NotFoundException('Product not found in wishlist');
      }

      await this.prisma.wishlist.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      return { message: 'Product removed from wishlist successfully' };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'removing product from wishlist',
      });
    }
  }

  async checkWishlistStatus(userId: number, productId: number) {
    try {
      const wishlistItem = await this.prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      return { isInWishlist: !!wishlistItem };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'checking wishlist status',
      });
    }
  }

  // ===== UTILITY AND HELPER METHODS =====

  async getFeaturedProducts(limit: number = 8) {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          isFeatured: true,
          isActive: true,
        },
        take: limit,
        include: {
          category: true,
          brand: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Calculate average ratings for featured products
      const productsWithRating = await Promise.all(
        products.map(async (product) => {
          const avgRating = await this.prisma.review.aggregate({
            where: { productId: product.id },
            _avg: {
              rating: true,
            },
          });

          return {
            ...product,
            averageRating: avgRating._avg.rating || 0,
          };
        }),
      );

      return productsWithRating;
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'fetching featured products',
      });
    }
  }

  async getProductStats(productId: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      const [reviewStats, wishlistCount, variantStats] = await Promise.all([
        this.prisma.review.aggregate({
          where: { productId },
          _count: true,
          _avg: {
            rating: true,
          },
        }),
        this.prisma.wishlist.count({
          where: { productId },
        }),
        this.prisma.productVariant.aggregate({
          where: { productId },
          _sum: {
            stock: true,
          },
          _count: true,
        }),
      ]);

      // Get rating distribution
      const ratingDistribution = await this.prisma.$queryRaw`
        SELECT rating, COUNT(*) as count
        FROM "Review"
        WHERE "productId" = ${productId}
        GROUP BY rating
        ORDER BY rating DESC
      `;

      return {
        productId,
        reviews: {
          total: reviewStats._count,
          averageRating: reviewStats._avg.rating || 0,
          distribution: ratingDistribution,
        },
        wishlistCount,
        inventory: {
          totalStock: variantStats._sum.stock || 0,
          totalVariants: variantStats._count,
        },
      };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'fetching product statistics',
      });
    }
  }

  async searchProducts(searchTerm: string, limit: number = 10) {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            {
              category: { name: { contains: searchTerm, mode: 'insensitive' } },
            },
            { brand: { name: { contains: searchTerm, mode: 'insensitive' } } },
          ],
        },
        take: limit,
        include: {
          category: true,
          brand: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return products;
    } catch (error) {
      this.errorHandler.handleError(error, { operation: 'searching products' });
    }
  }

  async getRelatedProducts(productId: number, limit: number = 4) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { categoryId: true, brandId: true },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      const relatedProducts = await this.prisma.product.findMany({
        where: {
          isActive: true,
          id: { not: productId },
          OR: [
            { categoryId: product.categoryId },
            { brandId: product.brandId },
          ],
        },
        take: limit,
        include: {
          category: true,
          brand: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return relatedProducts;
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'fetching related products',
      });
    }
  }
}
