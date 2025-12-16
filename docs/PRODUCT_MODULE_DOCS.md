# Product Module Documentation

## Overview

The Product module handles all product-related operations including CRUD operations, reviews, and wishlist management for the Saint Deals e-commerce platform.

## Features

### 🛍️ Product Management

- Create, read, update, and delete products
- Product variants (sizes, colors, stock levels)
- Product images with primary image support
- Category and brand associations
- Featured products
- SEO-friendly slugs
- Advanced filtering and pagination

### ⭐ Review System

- Create product reviews with ratings (1-5 stars)
- Optional review titles and comments
- Verified review status
- User attribution
- Average rating calculations
- Review filtering and search

### ❤️ Wishlist Management

- Add products to user wishlist
- Remove products from wishlist
- Check wishlist status
- Paginated wishlist queries
- Search within wishlist

## API Endpoints

### Product Endpoints

#### Create Product

```
POST /products
Authorization: Bearer token (Admin/Super Admin only)
Body: CreateProductDto
```

#### Get All Products

```
GET /products?page=1&limit=10&search=sneaker&categoryId=1
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10, max: 100)
  - search: string
  - categoryId: number
  - brandId: number
  - gender: 'MEN' | 'WOMEN' | 'UNISEX'
  - minPrice: number
  - maxPrice: number
  - isFeatured: boolean
  - isActive: boolean
  - sortBy: 'createdAt' | 'name' | 'basePrice' | 'updatedAt'
  - sortOrder: 'asc' | 'desc'
```

#### Get Featured Products

```
GET /products/featured?limit=8
```

#### Search Products

```
GET /products/search?q=nike&limit=10
```

#### Get Product by ID

```
GET /products/:id
```

#### Get Product by Slug

```
GET /products/slug/:slug
```

#### Get Product Statistics

```
GET /products/:id/stats
Returns:
  - Review statistics (count, average rating, distribution)
  - Wishlist count
  - Inventory information
```

#### Get Related Products

```
GET /products/:id/related?limit=4
```

#### Update Product

```
PUT /products/:id
Authorization: Bearer token (Admin/Super Admin only)
Body: UpdateProductDto
```

#### Delete Product

```
DELETE /products/:id
Authorization: Bearer token (Admin/Super Admin only)
```

### Review Endpoints

#### Create Review

```
POST /products/reviews
Authorization: Bearer token (Any authenticated user)
Body: CreateReviewDto
{
  "userId": 1,
  "productId": 1,
  "rating": 5,
  "title": "Great product!",
  "comment": "I really love this product...",
  "isVerified": false
}
```

#### Get All Reviews

```
GET /products/reviews?productId=1&rating=5
Query Parameters:
  - productId: number
  - userId: number
  - rating: number (1-5)
  - isVerified: boolean
  - search: string
  - page: number
  - limit: number
  - sortBy: 'createdAt' | 'rating' | 'updatedAt'
  - sortOrder: 'asc' | 'desc'
```

#### Get Review by ID

```
GET /products/reviews/:id
```

#### Update Review

```
PUT /products/reviews/:id
Authorization: Bearer token
Body: UpdateReviewDto
```

#### Delete Review

```
DELETE /products/reviews/:id
Authorization: Bearer token
```

### Wishlist Endpoints

#### Add to Wishlist

```
POST /products/wishlist
Authorization: Bearer token
Body: CreateWishlistDto
{
  "userId": 1,
  "productId": 1
}
```

#### Get Wishlist Items

```
GET /products/wishlist?userId=1
Authorization: Bearer token
Query Parameters:
  - userId: number
  - productId: number
  - search: string
  - page: number
  - limit: number
  - sortBy: 'createdAt' | 'product.name'
  - sortOrder: 'asc' | 'desc'
```

#### Check Wishlist Status

```
GET /products/wishlist/check/:userId/:productId
Authorization: Bearer token
```

#### Remove from Wishlist

```
DELETE /products/wishlist/:userId/:productId
Authorization: Bearer token
```

## DTOs (Data Transfer Objects)

### Product DTOs

- **CreateProductDto**: Complete product creation with variants and images
- **UpdateProductDto**: Partial product updates
- **QueryProductDto**: Advanced filtering and pagination
- **CreateProductVariantDto**: Product variant information
- **CreateProductImageDto**: Product image information

### Review DTOs

- **CreateReviewDto**: Create new review
- **UpdateReviewDto**: Update existing review
- **QueryReviewDto**: Filter and paginate reviews

### Wishlist DTOs

- **CreateWishlistDto**: Add product to wishlist
- **UpdateWishlistDto**: Update wishlist item
- **QueryWishlistDto**: Filter and paginate wishlist

## Service Methods

### Product Service Methods

- `create(createProductDto)`: Create a new product
- `findAll(queryDto)`: Get all products with filtering
- `findOne(id)`: Get product by ID
- `findBySlug(slug)`: Get product by slug
- `update(id, updateProductDto)`: Update product
- `remove(id)`: Delete product
- `getFeaturedProducts(limit)`: Get featured products
- `getProductStats(productId)`: Get product statistics
- `searchProducts(searchTerm, limit)`: Search products
- `getRelatedProducts(productId, limit)`: Get related products

### Review Service Methods

- `createReview(createReviewDto)`: Create a review
- `findAllReviews(queryDto)`: Get all reviews
- `findOneReview(id)`: Get review by ID
- `updateReview(id, updateReviewDto)`: Update review
- `removeReview(id)`: Delete review

### Wishlist Service Methods

- `addToWishlist(createWishlistDto)`: Add to wishlist
- `findAllWishlistItems(queryDto)`: Get wishlist items
- `removeFromWishlist(userId, productId)`: Remove from wishlist
- `checkWishlistStatus(userId, productId)`: Check if in wishlist

## Database Schema

### Product Model

- Core fields: name, slug, description, basePrice
- Relations: category, brand, variants, images, reviews, wishlist
- Metadata: gender, materials, measurements
- SEO: metaTitle, metaDescription
- Status: isFeatured, isActive

### ProductVariant Model

- Fields: sizeId, color, colorHex, stock, price, sku
- Unique constraint: productId + sizeId + color

### ProductImage Model

- Fields: url, alt, isPrimary, order
- Support for multiple images per product

### Review Model

- Fields: userId, productId, rating, title, comment, isVerified
- Unique constraint: userId + productId (one review per user per product)

### Wishlist Model

- Fields: userId, productId
- Unique constraint: userId + productId (no duplicates)

## Error Handling

All endpoints use centralized error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource (e.g., slug already exists)
- **500 Internal Server Error**: Unexpected errors

## Authentication & Authorization

### Public Endpoints

- GET /products (all read operations)
- GET /products/featured
- GET /products/search
- GET /products/:id
- GET /products/slug/:slug
- GET /products/reviews

### Authenticated Endpoints

- POST /products/reviews
- PUT /products/reviews/:id
- DELETE /products/reviews/:id
- POST /products/wishlist
- GET /products/wishlist
- DELETE /products/wishlist/:userId/:productId

### Admin Only Endpoints

- POST /products
- PUT /products/:id
- DELETE /products/:id

## Testing

### Unit Tests

- **product.service.spec.ts**: Service method tests with mocked dependencies
- **product.controller.spec.ts**: Controller endpoint tests with mocked service

### Running Tests

```bash
# Run all tests
npm test

# Run product module tests
npm test -- product

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Dependencies

### Internal Modules

- **PrismaModule**: Database access
- **CommonModule**: Error handling and utilities (CloudinaryService, ErrorHandlerService)

### External Packages

- `@nestjs/common`: Core NestJS decorators and utilities
- `@nestjs/swagger`: API documentation
- `class-validator`: DTO validation
- `class-transformer`: Data transformation
- `@prisma/client`: Database ORM

## Best Practices

1. **Always use DTOs** for input validation
2. **Use proper HTTP status codes** in responses
3. **Include pagination** for list endpoints
4. **Validate relationships** before creating/updating
5. **Use transactions** for complex operations
6. **Handle errors consistently** with ErrorHandlerService
7. **Document all endpoints** with Swagger decorators
8. **Test all service methods** with unit tests

## Future Enhancements

- [ ] Product import/export functionality
- [ ] Bulk product operations
- [ ] Product analytics and insights
- [ ] Review moderation system
- [ ] Wishlist sharing
- [ ] Product comparison feature
- [ ] Inventory alerts
- [ ] Price history tracking
- [ ] Product recommendations AI
- [ ] Multi-language support
