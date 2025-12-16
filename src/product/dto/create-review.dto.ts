import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  Min,
  Max,
  IsInt,
  IsBoolean,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 1,
    description: 'User ID who is creating the review',
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 1,
    description: 'Product ID being reviewed',
  })
  @IsInt()
  productId: number;

  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 5,
    description: 'Rating from 1 to 5 stars',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Great product!',
    required: false,
    description: 'Review title',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'I really love this product. Great quality and fast shipping!',
    required: false,
    description: 'Detailed review comment',
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    description: 'whether the product is verified or not',
    example: true,
    required: false,
    default: false,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  @IsBoolean()
  isVerified: boolean;
}
