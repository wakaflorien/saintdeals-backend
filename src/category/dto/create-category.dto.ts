import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'electronics', required: true })
  @IsString()
  @IsOptional()
  slug: string;

  @ApiProperty({ example: 'Devices and gadgets', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Category image file',
  })
  imageUrl?: any;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  isActive?: boolean;
}
