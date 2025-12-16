import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
  IsDecimal,
  IsEnum,
} from 'class-validator';

export class QueryProductDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by category ID',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by brand ID',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  brandId?: number;

  @ApiPropertyOptional({
    example: 'MEN',
    enum: ['MEN', 'WOMEN', 'UNISEX'],
    description: 'Filter by gender',
  })
  @IsEnum(['MEN', 'WOMEN', 'UNISEX'])
  @IsOptional()
  gender?: 'MEN' | 'WOMEN' | 'UNISEX';

  @ApiPropertyOptional({
    example: 'sneaker',
    description: 'Search products by name or description',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 50.0,
    description: 'Minimum price filter',
  })
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({
    example: 500.0,
    description: 'Maximum price filter',
  })
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by featured products',
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active products',
    default: true,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

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
    description: 'Number of products per page',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'createdAt',
    enum: ['createdAt', 'name', 'basePrice', 'updatedAt'],
    description: 'Sort products by field',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'basePrice' | 'updatedAt' = 'createdAt';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
