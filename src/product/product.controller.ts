import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { QueryWishlistDto } from './dto/query-wishlist.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ===== PRODUCT ENDPOINTS =====

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new product with image uploads' })
  @ApiBody({
    description: 'Product creation with image files',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product images (max 10)',
        },
        name: { type: 'string', example: 'Nike Air Max 90' },
        slug: { type: 'string', example: 'nike-air-max-90' },
        description: {
          type: 'string',
          example: 'Classic Nike sneaker with Air Max cushioning',
        },
        basePrice: { type: 'number', example: 120.99 },
        categoryId: { type: 'number', example: 1 },
        brandId: { type: 'number', example: 1 },
        gender: {
          type: 'string',
          enum: ['MEN', 'WOMEN', 'UNISEX'],
          example: 'MEN',
        },
        upperMaterial: { type: 'string', example: 'Leather' },
        soleMaterial: { type: 'string', example: 'Rubber' },
        heelHeight: { type: 'number', example: 3.5 },
        closureType: { type: 'string', example: 'Laces' },
        isFeatured: { type: 'boolean', example: false },
        isActive: { type: 'boolean', example: true },
        metaTitle: {
          type: 'string',
          example: 'Nike Air Max 90 - Premium Sneakers',
        },
        metaDescription: {
          type: 'string',
          example: 'Shop the iconic Nike Air Max 90 sneakers...',
        },
        variants: {
          type: 'string',
          example: JSON.stringify([
            {
              sizeId: 1,
              color: 'Black',
              colorHex: '#000000',
              stock: 50,
              price: 120.99,
              sku: 'NIKE-AM90-BLK-42',
            },
          ]),
          description: 'JSON string of product variants array',
        },
      },
      required: ['name', 'slug', 'basePrice', 'categoryId', 'brandId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Product with this slug already exists',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.productService.create(createProductDto, images);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async findAll(@Query() queryDto: QueryProductDto) {
    return this.productService.findAll(queryDto);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of featured products to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Featured products retrieved successfully',
  })
  async getFeatured(@Query('limit', ParseIntPipe) limit?: number) {
    return this.productService.getFeaturedProducts(limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by term' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of results to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async search(
    @Query('q') searchTerm: string,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.productService.searchProducts(searchTerm, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiParam({ name: 'slug', type: String, description: 'Product slug' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findBySlug(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get product statistics' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product statistics retrieved successfully',
  })
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductStats(id);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of related products to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Related products retrieved successfully',
  })
  async getRelated(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.productService.getRelatedProducts(id, limit);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a product with optional image uploads' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiBody({
    description: 'Product update with optional image files',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'New product images (optional, max 10)',
        },
        name: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        basePrice: { type: 'number' },
        categoryId: { type: 'number' },
        brandId: { type: 'number' },
        gender: { type: 'string', enum: ['MEN', 'WOMEN', 'UNISEX'] },
        upperMaterial: { type: 'string' },
        soleMaterial: { type: 'string' },
        heelHeight: { type: 'number' },
        closureType: { type: 'string' },
        isFeatured: { type: 'boolean' },
        isActive: { type: 'boolean' },
        metaTitle: { type: 'string' },
        metaDescription: { type: 'string' },
        variants: {
          type: 'string',
          description: 'JSON string of product variants array',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.productService.update(id, updateProductDto, images);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }

  // ===== REVIEW ENDPOINTS =====

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product review' })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'User has already reviewed this product',
  })
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return this.productService.createReview(createReviewDto);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'Get all reviews with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
  })
  async findAllReviews(@Query() queryDto: QueryReviewDto) {
    return this.productService.findAllReviews(queryDto);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Review ID' })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async findOneReview(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOneReview(id);
  }

  @Put('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review' })
  @ApiParam({ name: 'id', type: Number, description: 'Review ID' })
  @ApiBody({ type: UpdateReviewDto })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.productService.updateReview(id, updateReviewDto);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'id', type: Number, description: 'Review ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  async removeReview(@Param('id', ParseIntPipe) id: number) {
    return this.productService.removeReview(id);
  }

  // ===== WISHLIST ENDPOINTS =====

  @Post('wishlist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiBody({ type: CreateWishlistDto })
  @ApiResponse({
    status: 201,
    description: 'Product added to wishlist successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Product already in wishlist',
  })
  async addToWishlist(@Body() createWishlistDto: CreateWishlistDto) {
    return this.productService.addToWishlist(createWishlistDto);
  }

  @Get('wishlist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get wishlist items with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Wishlist items retrieved successfully',
  })
  async findAllWishlist(@Query() queryDto: QueryWishlistDto) {
    return this.productService.findAllWishlistItems(queryDto);
  }

  @Get('wishlist/check/:userId/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if product is in wishlist' })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  @ApiParam({ name: 'productId', type: Number, description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Wishlist status retrieved successfully',
  })
  async checkWishlist(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.productService.checkWishlistStatus(userId, productId);
  }

  @Delete('wishlist/:userId/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  @ApiParam({ name: 'productId', type: Number, description: 'Product ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Product removed from wishlist successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found in wishlist',
  })
  async removeFromWishlist(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.productService.removeFromWishlist(userId, productId);
  }
}
