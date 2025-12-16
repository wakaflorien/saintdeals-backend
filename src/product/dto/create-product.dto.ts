import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  Min,
  IsEnum,
  IsDecimal,
  IsBoolean,
  ValidateNested,
  IsUrl,
  IsInt,
  IsHexColor,
} from 'class-validator';

export class CreateProductVariantDto {
  @ApiProperty({ example: 1, description: 'Size ID from the Size model' })
  @IsInt()
  @Min(1)
  sizeId: number;

  @ApiProperty({ example: 'Black', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: '#000000', required: false })
  @IsHexColor()
  @IsOptional()
  colorHex?: string;

  @ApiProperty({ example: 50, minimum: 0 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 120.99, minimum: 0 })
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  price: number;

  @ApiProperty({ example: 'SHOE-BLK-41' })
  @IsString()
  sku: string;
}

export class CreateProductImageDto {
  @ApiProperty({ example: 'https://example.com/image1.jpg' })
  @IsUrl()
  url: string;

  @ApiProperty({ example: 'Product front view', required: false })
  @IsString()
  @IsOptional()
  alt?: string;

  @ApiProperty({ example: true, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiProperty({ example: 0, required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Product Name', required: true })
  @IsString()
  name: string;

  @ApiProperty({ example: 'product-name', required: true })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Product Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 100.99, required: true })
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  basePrice: number;

  @ApiProperty({ example: 1, description: 'Category ID', required: true })
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiProperty({ example: 1, description: 'Brand ID', required: true })
  @IsInt()
  @Min(1)
  brandId: number;

  @ApiProperty({
    example: 'MEN',
    enum: ['MEN', 'WOMEN', 'UNISEX'],
    required: false,
  })
  @IsEnum(['MEN', 'WOMEN', 'UNISEX'])
  @IsOptional()
  gender?: 'MEN' | 'WOMEN' | 'UNISEX';

  @ApiProperty({ example: 'Leather', required: false })
  @IsString()
  @IsOptional()
  upperMaterial?: string;

  @ApiProperty({ example: 'Rubber', required: false })
  @IsString()
  @IsOptional()
  soleMaterial?: string;

  @ApiProperty({ example: 5.5, required: false })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  heelHeight?: number;

  @ApiProperty({ example: 'Laces', required: false })
  @IsString()
  @IsOptional()
  closureType?: string;

  @ApiProperty({
    description: 'Whether the product is featured on the homepage',
    example: false,
    required: false,
    default: false,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({
    description: 'Whether the product is active and available for purchase',
    example: true,
    required: false,
    default: true,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 'new arrivals, summer collection', required: false })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiProperty({
    example: 'This is a sample product description for SEO purposes.',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiProperty({
    description:
      'Product variants with sizes, colors, and individual stock/pricing',
    type: [CreateProductVariantDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  @IsOptional()
  variants?: CreateProductVariantDto[];

  @ApiProperty({
    description: 'Product images with metadata',
    type: [CreateProductImageDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  @IsOptional()
  images?: CreateProductImageDto[];
}
