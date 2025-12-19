import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ShipmentStatus } from '@prisma/client';

export class UpdateShipmentDto {
  @ApiPropertyOptional({ example: 'FedEx', description: 'Carrier name' })
  @IsString()
  @IsOptional()
  carrier?: string;

  @ApiPropertyOptional({ example: 'FX123456789', description: 'Tracking number' })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({
    example: 'SHIPPED',
    enum: ShipmentStatus,
    description: 'Shipment status',
  })
  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus;

  @ApiPropertyOptional({
    example: '2024-12-20T10:00:00Z',
    description: 'Shipped date',
  })
  @IsDateString()
  @IsOptional()
  shippedAt?: string;

  @ApiPropertyOptional({
    example: '2024-12-25T10:00:00Z',
    description: 'Estimated delivery date',
  })
  @IsDateString()
  @IsOptional()
  estimatedAt?: string;

  @ApiPropertyOptional({
    example: '2024-12-24T14:30:00Z',
    description: 'Delivered date',
  })
  @IsDateString()
  @IsOptional()
  deliveredAt?: string;
}

