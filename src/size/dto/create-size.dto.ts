import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';
import { ShoeSize } from '@prisma/client';

export class CreateSizeDto {
  @ApiProperty({
    example: 'EU_41',
    enum: ShoeSize,
    description: 'Shoe size value (e.g., EU_41, US_8, UK_7)',
  })
  @IsEnum(ShoeSize, {
    message: 'sizeValue must be a valid ShoeSize enum value',
  })
  @IsNotEmpty()
  sizeValue: ShoeSize;

  @ApiProperty({
    example: '41 EU',
    description: 'Human-readable size display value (e.g., "41 EU" or "8 US")',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'displayValue must not exceed 20 characters' })
  displayValue: string;
}
