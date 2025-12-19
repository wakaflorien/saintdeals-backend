import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsOptional } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 2, description: 'New quantity', minimum: 1, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}

