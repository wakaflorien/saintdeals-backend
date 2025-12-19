import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { ShipmentStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class ShipmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(createShipmentDto: CreateShipmentDto) {
    try {
      // Verify order exists
      const order = await this.prisma.order.findUnique({
        where: { id: createShipmentDto.orderId },
      });

      if (!order) {
        throw new NotFoundException(
          `Order with ID ${createShipmentDto.orderId} not found`,
        );
      }

      // Check if shipment already exists for this order
      const existingShipment = await this.prisma.shipment.findUnique({
        where: { orderId: createShipmentDto.orderId },
      });

      if (existingShipment) {
        throw new ConflictException(
          `Shipment already exists for order ${createShipmentDto.orderId}`,
        );
      }

      const shipmentData: any = {
        orderId: createShipmentDto.orderId,
        carrier: createShipmentDto.carrier,
        trackingNumber: createShipmentDto.trackingNumber,
        status: createShipmentDto.status || ShipmentStatus.PENDING,
        estimatedAt: createShipmentDto.estimatedAt
          ? new Date(createShipmentDto.estimatedAt)
          : null,
      };

      // Create shipment and update order status in transaction
      return await this.prisma.$transaction(async (tx) => {
        const shipment = await tx.shipment.create({
          data: shipmentData,
          include: {
            order: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                shippingAddress: true,
              },
            },
          },
        });

        // Update order status to SHIPPED if shipment is created with SHIPPED status
        if (shipment.status === ShipmentStatus.SHIPPED) {
          await tx.order.update({
            where: { id: createShipmentDto.orderId },
            data: { status: OrderStatus.SHIPPED },
          });
        }

        return shipment;
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'creating shipment' });
    }
  }

  async findAll() {
    try {
      return await this.prisma.shipment.findMany({
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              shippingAddress: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'fetching shipments' });
    }
  }

  async findOne(id: number) {
    try {
      const shipment = await this.prisma.shipment.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              shippingAddress: true,
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
          },
        },
      });

      if (!shipment) {
        throw new NotFoundException(`Shipment with ID ${id} not found`);
      }

      return shipment;
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'fetching shipment' });
    }
  }

  async findByOrderId(orderId: number) {
    try {
      const shipment = await this.prisma.shipment.findUnique({
        where: { orderId },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              shippingAddress: true,
            },
          },
        },
      });

      if (!shipment) {
        throw new NotFoundException(
          `Shipment for order ${orderId} not found`,
        );
      }

      return shipment;
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'fetching shipment' });
    }
  }

  async update(id: number, updateShipmentDto: UpdateShipmentDto) {
    try {
      const shipment = await this.prisma.shipment.findUnique({
        where: { id },
        include: { order: true },
      });

      if (!shipment) {
        throw new NotFoundException(`Shipment with ID ${id} not found`);
      }

      const updateData: any = { ...updateShipmentDto };
      if (updateShipmentDto.shippedAt) {
        updateData.shippedAt = new Date(updateShipmentDto.shippedAt);
      }
      if (updateShipmentDto.estimatedAt) {
        updateData.estimatedAt = new Date(updateShipmentDto.estimatedAt);
      }
      if (updateShipmentDto.deliveredAt) {
        updateData.deliveredAt = new Date(updateShipmentDto.deliveredAt);
      }

      // Update shipment and order status in transaction
      return await this.prisma.$transaction(async (tx) => {
        const updatedShipment = await tx.shipment.update({
          where: { id },
          data: updateData,
          include: {
            order: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                shippingAddress: true,
              },
            },
          },
        });

        // Update order status based on shipment status
        if (updateShipmentDto.status) {
          let orderStatus: OrderStatus | null = null;

          if (updateShipmentDto.status === ShipmentStatus.SHIPPED) {
            orderStatus = OrderStatus.SHIPPED;
          } else if (updateShipmentDto.status === ShipmentStatus.DELIVERED) {
            orderStatus = OrderStatus.DELIVERED;
          }

          if (orderStatus) {
            await tx.order.update({
              where: { id: shipment.orderId },
              data: { status: orderStatus },
            });
          }
        }

        return updatedShipment;
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'updating shipment' });
    }
  }

  async remove(id: number) {
    try {
      const shipment = await this.prisma.shipment.findUnique({
        where: { id },
      });

      if (!shipment) {
        throw new NotFoundException(`Shipment with ID ${id} not found`);
      }

      await this.prisma.shipment.delete({
        where: { id },
      });

      return { message: 'Shipment deleted successfully' };
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'deleting shipment' });
    }
  }
}

