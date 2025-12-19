import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }

  async create(userId: number, createOrderDto: CreateOrderDto) {
    try {
      // Verify shipping address belongs to user
      const address = await this.prisma.address.findFirst({
        where: {
          id: createOrderDto.shippingAddressId,
          userId: userId,
        },
      });

      if (!address) {
        throw new NotFoundException('Shipping address not found');
      }

      // Verify all variants exist and have stock
      const variantIds = createOrderDto.items.map((item) => item.variantId);
      const variants = await this.prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      });

      if (variants.length !== variantIds.length) {
        throw new NotFoundException('One or more product variants not found');
      }

      // Check stock availability
      for (const item of createOrderDto.items) {
        const variant = variants.find((v) => v.id === item.variantId);
        if (!variant) continue;

        if (!variant.product.isActive) {
          throw new BadRequestException(
            `Product ${variant.product.name} is not active`,
          );
        }

        if (variant.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for variant ${variant.id}. Available: ${variant.stock}, Requested: ${item.quantity}`,
          );
        }
      }

      // Calculate subtotal
      let subtotal = 0;
      const orderItems = createOrderDto.items.map((item) => {
        const variant = variants.find((v) => v.id === item.variantId);
        if (!variant) {
          throw new NotFoundException(`Product variant with id ${item.variantId} not found`);
        }
        const price = Number(variant.price);
        const itemSubtotal = price * item.quantity;
        subtotal += itemSubtotal;

        return {
          variantId: item.variantId,
          quantity: item.quantity,
          price: price,
          subtotal: itemSubtotal,
        };
      });

      // Apply discount if provided
      let discountAmount = 0;
      let discountId: number | null = null;

      if (createOrderDto.discountCode) {
        const discount = await this.prisma.discount.findUnique({
          where: { code: createOrderDto.discountCode },
        });

        if (discount && discount.isActive) {
          if (discount.expiresAt && discount.expiresAt < new Date()) {
            throw new BadRequestException('Discount code has expired');
          }

          if (discount.maxUses && discount.currentUses >= discount.maxUses) {
            throw new BadRequestException('Discount code has reached maximum uses');
          }

          if (
            discount.minOrderTotal &&
            subtotal < Number(discount.minOrderTotal)
          ) {
            throw new BadRequestException(
              `Minimum order total of ${discount.minOrderTotal} required for this discount`,
            );
          }

          discountId = discount.id;

          if (discount.type === 'PERCENT') {
            discountAmount = (subtotal * Number(discount.value)) / 100;
          } else if (discount.type === 'FIXED') {
            discountAmount = Number(discount.value);
          } else if (discount.type === 'FREE_SHIPPING') {
            discountAmount = createOrderDto.shippingCost || 0;
          }

          // Update discount usage
          await this.prisma.discount.update({
            where: { id: discount.id },
            data: { currentUses: { increment: 1 } },
          });
        } else {
          throw new NotFoundException('Invalid or inactive discount code');
        }
      }

      const tax = createOrderDto.tax || 0;
      const shippingCost =
        createOrderDto.shippingCost && discountAmount < (createOrderDto.shippingCost || 0)
          ? (createOrderDto.shippingCost || 0) - discountAmount
          : createOrderDto.shippingCost || 0;

      const total = subtotal + tax + shippingCost - discountAmount;

      // Create order with items in a transaction
      const order = await this.prisma.$transaction(async (tx) => {
        // Create order
        const newOrder = await tx.order.create({
          data: {
            userId,
            orderNumber: await this.generateOrderNumber(),
            status: OrderStatus.PENDING,
            subtotal: subtotal,
            tax: tax,
            shippingCost: shippingCost,
            discountAmount: discountAmount,
            discountId: discountId,
            total: total,
            shippingAddressId: createOrderDto.shippingAddressId,
            notes: createOrderDto.notes,
            items: {
              create: orderItems,
            },
          },
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
            shippingAddress: true,
            discount: true,
          },
        });

        // Update stock for all variants
        for (const item of createOrderDto.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return newOrder;
      });

      return order;
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'creating order' });
    }
  }

  async findAll(queryDto: QueryOrderDto) {
    try {
      const { page = 1, limit = 10, userId, status } = queryDto;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (userId) where.userId = userId;
      if (status) where.status = status;

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
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
            shippingAddress: true,
            discount: true,
            payment: true,
            shipment: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.order.count({ where }),
      ]);

      return {
        data: orders,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'fetching orders' });
    }
  }

  async findOne(id: number) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: true,
                    },
                  },
                  size: true,
                },
              },
            },
          },
          shippingAddress: true,
          discount: true,
          payment: true,
          shipment: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return order;
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'fetching order' });
    }
  }

  async findByOrderNumber(orderNumber: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { orderNumber },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: true,
                    },
                  },
                  size: true,
                },
              },
            },
          },
          shippingAddress: true,
          discount: true,
          payment: true,
          shipment: true,
        },
      });

      if (!order) {
        throw new NotFoundException(
          `Order with number ${orderNumber} not found`,
        );
      }

      return order;
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'fetching order' });
    }
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return await this.prisma.order.update({
        where: { id },
        data: updateOrderDto,
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
          shippingAddress: true,
          discount: true,
          payment: true,
          shipment: true,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'updating order' });
    }
  }

  async cancelOrder(userId: number, orderId: number) {
    try {
      const order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId: userId,
        },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Order is already cancelled');
      }

      if (order.status === OrderStatus.DELIVERED) {
        throw new BadRequestException('Cannot cancel a delivered order');
      }

      // Restore stock and cancel order in transaction
      return await this.prisma.$transaction(async (tx) => {
        // Restore stock
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }

        // Cancel order
        return await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.CANCELLED },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: true,
                    size: true,
                  },
                },
              },
            },
          },
        });
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'cancelling order' });
    }
  }
}

