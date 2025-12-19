import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({ example: 1, description: 'Product variant ID' })
  @IsInt()
  @Min(1)
  variantId: number;

  @ApiProperty({ example: 1, description: 'Quantity to add', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

