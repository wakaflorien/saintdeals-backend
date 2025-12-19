import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Shipments')
@Controller('shipments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new shipment (admin only)' })
  @ApiResponse({ status: 201, description: 'Shipment created successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 409, description: 'Shipment already exists for order' })
  async create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentService.create(createShipmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shipments (admin only)' })
  @ApiResponse({ status: 200, description: 'Shipments retrieved successfully' })
  async findAll() {
    return this.shipmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'Shipment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentService.findOne(id);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get shipment by order ID (admin only)' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Shipment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async findByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.shipmentService.findByOrderId(orderId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update shipment (admin only)' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'Shipment updated successfully' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShipmentDto: UpdateShipmentDto,
  ) {
    return this.shipmentService.update(id, updateShipmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete shipment (admin only)' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'Shipment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentService.remove(id);
  }
}

