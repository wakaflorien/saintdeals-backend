import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, IsOptional, IsString, IsDecimal, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1, description: 'Product variant ID' })
  @IsInt()
  @Min(1)
  variantId: number;

  @ApiProperty({ example: 2, description: 'Quantity', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'Shipping address ID' })
  @IsInt()
  @Min(1)
  shippingAddressId: number;

  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Order items',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({ example: 'Please leave at the door', description: 'Order notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 10.0, description: 'Tax amount' })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  tax?: number;

  @ApiPropertyOptional({ example: 5.0, description: 'Shipping cost' })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  shippingCost?: number;

  @ApiPropertyOptional({ example: 'SHOEFAN20', description: 'Discount code' })
  @IsString()
  @IsOptional()
  discountCode?: string;
}

