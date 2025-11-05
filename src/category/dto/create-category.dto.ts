import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'electronics' })
  @IsString()
  @IsOptional()
  slug: string;

  @ApiProperty({ example: 'Devices and gadgets', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
    required: false,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
