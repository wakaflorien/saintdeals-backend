import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAddressDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123 Main St', description: 'Street address' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'New York', description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY', description: 'State' })
  @IsString()
  state: string;

  @ApiProperty({ example: '10001', description: 'ZIP code' })
  @IsString()
  zipCode: string;

  @ApiProperty({ example: 'United States', description: 'Country' })
  @IsString()
  country: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Set as default address',
    default: false,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

