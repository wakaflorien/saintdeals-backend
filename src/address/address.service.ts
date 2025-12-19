import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(userId: number, createAddressDto: CreateAddressDto) {
    try {
      // If setting as default, unset other default addresses
      if (createAddressDto.isDefault) {
        await this.prisma.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return await this.prisma.address.create({
        data: {
          ...createAddressDto,
          userId,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'creating address' });
    }
  }

  async findAll(userId: number) {
    try {
      return await this.prisma.address.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'fetching addresses' });
    }
  }

  async findOne(userId: number, id: number) {
    try {
      const address = await this.prisma.address.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      return address;
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'fetching address' });
    }
  }

  async update(userId: number, id: number, updateAddressDto: UpdateAddressDto) {
    try {
      const address = await this.prisma.address.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      // If setting as default, unset other default addresses
      if (updateAddressDto.isDefault) {
        await this.prisma.address.updateMany({
          where: { userId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return await this.prisma.address.update({
        where: { id },
        data: updateAddressDto,
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'updating address' });
    }
  }

  async remove(userId: number, id: number) {
    try {
      const address = await this.prisma.address.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      // Check if address is used in any orders
      const orderCount = await this.prisma.order.count({
        where: { shippingAddressId: id },
      });

      if (orderCount > 0) {
        throw new BadRequestException(
          'Cannot delete address that is associated with orders',
        );
      }

      await this.prisma.address.delete({
        where: { id },
      });

      return { message: 'Address deleted successfully' };
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'deleting address' });
    }
  }

  async setDefault(userId: number, id: number) {
    try {
      const address = await this.prisma.address.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }

      // Unset all other default addresses
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      // Set this address as default
      return await this.prisma.address.update({
        where: { id },
        data: { isDefault: true },
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'setting default address' });
    }
  }
}

