import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';

export class QueryWishlistDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filter wishlist by user ID',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter wishlist by product ID',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  productId?: number;

  @ApiPropertyOptional({
    example: 'sneaker',
    description: 'Search wishlist items by product name',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    default: 1,
    description: 'Page number for pagination',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Number of wishlist items per page',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'createdAt',
    enum: ['createdAt', 'product.name'],
    description: 'Sort wishlist by field',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'product.name' = 'createdAt';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
