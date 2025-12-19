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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/auth.types';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart with all items' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@Req() request: AuthenticatedRequest) {
    const userId = parseInt(request.user.id);
    return this.cartService.getCart(userId);
  }

  @Get('total')
  @ApiOperation({ summary: 'Get cart total and item count' })
  @ApiResponse({ status: 200, description: 'Cart total calculated successfully' })
  async getCartTotal(@Req() request: AuthenticatedRequest) {
    const userId = parseInt(request.user.id);
    return this.cartService.getCartTotal(userId);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  @ApiResponse({ status: 404, description: 'Product variant not found' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  async addItem(
    @Req() request: AuthenticatedRequest,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    const userId = parseInt(request.user.id);
    return this.cartService.addItem(userId, createCartItemDto);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateItem(
    @Req() request: AuthenticatedRequest,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const userId = parseInt(request.user.id);
    return this.cartService.updateItem(userId, itemId, updateCartItemDto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async removeItem(
    @Req() request: AuthenticatedRequest,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    const userId = parseInt(request.user.id);
    return this.cartService.removeItem(userId, itemId);
  }

  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(@Req() request: AuthenticatedRequest) {
    const userId = parseInt(request.user.id);
    return this.cartService.clearCart(userId);
  }
}

