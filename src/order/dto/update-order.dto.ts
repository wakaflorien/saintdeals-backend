import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    example: 'PROCESSING',
    enum: OrderStatus,
    description: 'Order status',
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 'Order notes', description: 'Order notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

