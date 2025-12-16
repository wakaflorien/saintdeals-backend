import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateWishlistDto {
  @ApiProperty({
    example: 1,
    description: 'User ID who is adding the product to wishlist',
  })
  @IsInt()
  userId: number;

  @ApiProperty({
    example: 1,
    description: 'Product ID to be added to wishlist',
  })
  @IsInt()
  productId: number;
}
