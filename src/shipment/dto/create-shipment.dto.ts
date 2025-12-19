import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { ShipmentStatus } from '@prisma/client';

export class CreateShipmentDto {
  @ApiProperty({ example: 1, description: 'Order ID' })
  @IsInt()
  @Min(1)
  orderId: number;

  @ApiPropertyOptional({ example: 'FedEx', description: 'Carrier name' })
  @IsString()
  @IsOptional()
  carrier?: string;

  @ApiPropertyOptional({ example: 'FX123456789', description: 'Tracking number' })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({
    example: 'PENDING',
    enum: ShipmentStatus,
    description: 'Shipment status',
    default: 'PENDING',
  })
  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus;

  @ApiPropertyOptional({
    example: '2024-12-25T10:00:00Z',
    description: 'Estimated delivery date',
  })
  @IsDateString()
  @IsOptional()
  estimatedAt?: string;
}

