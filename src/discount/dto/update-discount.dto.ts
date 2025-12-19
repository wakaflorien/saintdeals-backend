import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsDecimal,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { DiscountType } from '@prisma/client';

export class UpdateDiscountDto {
  @ApiPropertyOptional({ example: 'SHOEFAN20', description: 'Discount code' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    example: 'PERCENT',
    enum: DiscountType,
    description: 'Discount type',
  })
  @IsEnum(DiscountType)
  @IsOptional()
  type?: DiscountType;

  @ApiPropertyOptional({
    example: 20.0,
    description: 'Discount value (percent or fixed amount)',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  @IsOptional()
  value?: number;

  @ApiPropertyOptional({
    example: 100.0,
    description: 'Minimum order total required',
  })
  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  minOrderTotal?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the discount is active',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59Z',
    description: 'Expiration date',
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Maximum number of uses',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxUses?: number;
}

