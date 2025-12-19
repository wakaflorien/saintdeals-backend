import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/types/auth.types';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 404, description: 'Address or variant not found' })
  @ApiResponse({ status: 400, description: 'Insufficient stock or invalid discount' })
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const userId = parseInt(request.user.id);
    return this.orderService.create(userId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders (admin) or user orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAll(
    @Req() request: AuthenticatedRequest,
    @Query() queryDto: QueryOrderDto,
  ) {
    const userId = parseInt(request.user.id);
    const userRole = request.user.role;

    // If not admin, only show user's orders
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      queryDto.userId = userId;
    }

    return this.orderService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const order = await this.orderService.findOne(id);
    const userId = parseInt(request.user.id);
    const userRole = request.user.role;

    // If not admin and not the order owner, deny access
    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.SUPER_ADMIN &&
      order.userId !== userId
    ) {
      throw new UnauthorizedException('You do not have access to this order');
    }

    return order;
  }

  @Get('number/:orderNumber')
  @ApiOperation({ summary: 'Get order by order number' })
  @ApiParam({ name: 'orderNumber', description: 'Order number' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findByOrderNumber(
    @Req() request: AuthenticatedRequest,
    @Param('orderNumber') orderNumber: string,
  ) {
    const order = await this.orderService.findByOrderNumber(orderNumber);
    const userId = parseInt(request.user.id);
    const userRole = request.user.role;

    // If not admin and not the order owner, deny access
    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.SUPER_ADMIN &&
      order.userId !== userId
    ) {
      throw new UnauthorizedException('You do not have access to this order');
    }

    return order;
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update order (admin only)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Cannot cancel this order' })
  async cancelOrder(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = parseInt(request.user.id);
    return this.orderService.cancelOrder(userId, id);
  }
}

