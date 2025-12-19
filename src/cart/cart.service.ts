import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { QueryCartDto } from './dto/query-cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async getOrCreateCart(userId: number) {
    try {
      let cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: {
                        where: { isPrimary: true },
                        take: 1,
                      },
                    },
                  },
                  size: true,
                },
              },
            },
          },
        },
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      include: {
                        images: {
                          where: { isPrimary: true },
                          take: 1,
                        },
                      },
                    },
                    size: true,
                  },
                },
              },
            },
          },
        });
      }

      return cart;
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'getting or creating cart' });
    }
  }

  async addItem(userId: number, createCartItemDto: CreateCartItemDto) {
    try {
      // Get or create cart
      const cart = await this.getOrCreateCart(userId);

      // Verify variant exists and has stock
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: createCartItemDto.variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new NotFoundException(
          `Product variant with ID ${createCartItemDto.variantId} not found`,
        );
      }

      if (!variant.product.isActive) {
        throw new BadRequestException('Product is not active');
      }

      if (variant.stock < createCartItemDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${variant.stock}`,
        );
      }

      // Check if item already exists in cart
      const existingItem = await this.prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId: createCartItemDto.variantId,
          },
        },
      });

      if (existingItem) {
        // Update quantity if item exists
        const newQuantity = existingItem.quantity + createCartItemDto.quantity;
        if (variant.stock < newQuantity) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${variant.stock}, Requested: ${newQuantity}`,
          );
        }

        return await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                    },
                  },
                },
                size: true,
              },
            },
          },
        });
      }

      // Create new cart item
      return await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: createCartItemDto.variantId,
          quantity: createCartItemDto.quantity,
        },
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
              size: true,
            },
          },
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'adding item to cart' });
    }
  }

  async updateItem(
    userId: number,
    itemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    try {
      const cart = await this.getOrCreateCart(userId);

      const cartItem = await this.prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
        include: { variant: true },
      });

      if (!cartItem) {
        throw new NotFoundException(
          `Cart item with ID ${itemId} not found in your cart`,
        );
      }

      if (updateCartItemDto.quantity !== undefined) {
        if (cartItem.variant.stock < updateCartItemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${cartItem.variant.stock}`,
          );
        }
      }

      return await this.prisma.cartItem.update({
        where: { id: itemId },
        data: updateCartItemDto,
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
              size: true,
            },
          },
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'updating cart item' });
    }
  }

  async removeItem(userId: number, itemId: number) {
    try {
      const cart = await this.getOrCreateCart(userId);

      const cartItem = await this.prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
      });

      if (!cartItem) {
        throw new NotFoundException(
          `Cart item with ID ${itemId} not found in your cart`,
        );
      }

      await this.prisma.cartItem.delete({
        where: { id: itemId },
      });

      return { message: 'Item removed from cart successfully' };
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'removing cart item' });
    }
  }

  async clearCart(userId: number) {
    try {
      const cart = await this.getOrCreateCart(userId);

      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return { message: 'Cart cleared successfully' };
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'clearing cart' });
    }
  }

  async getCart(userId: number) {
    try {
      return await this.getOrCreateCart(userId);
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'getting cart' });
    }
  }

  async getCartTotal(userId: number) {
    try {
      const cart = await this.getOrCreateCart(userId);

      const items = await this.prisma.cartItem.findMany({
        where: { cartId: cart.id },
        include: {
          variant: {
            select: {
              price: true,
            },
          },
        },
      });

      const total = items.reduce((sum, item) => {
        return sum + Number(item.variant.price) * item.quantity;
      }, 0);

      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      return {
        total: Number(total.toFixed(2)),
        itemCount,
        items: items.length,
      };
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'calculating cart total' });
    }
  }
}

