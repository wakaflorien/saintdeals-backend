import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'BrandName' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'brand-name' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Brand description' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Whether the brand is active',
    example: true,
    required: false,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  @IsOptional()
  isActive: boolean;
}
