import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorHandlerService } from '../common/error-handler.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { QueryDiscountDto } from './dto/query-discount.dto';

@Injectable()
export class DiscountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(createDiscountDto: CreateDiscountDto) {
    try {
      // Check if code already exists
      const existing = await this.prisma.discount.findUnique({
        where: { code: createDiscountDto.code },
      });

      if (existing) {
        throw new ConflictException(
          `Discount code '${createDiscountDto.code}' already exists`,
        );
      }

      return await this.prisma.discount.create({
        data: {
          ...createDiscountDto,
          value: Number(createDiscountDto.value),
          minOrderTotal: createDiscountDto.minOrderTotal
            ? Number(createDiscountDto.minOrderTotal)
            : null,
          expiresAt: createDiscountDto.expiresAt
            ? new Date(createDiscountDto.expiresAt)
            : null,
        },
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'creating discount' });
    }
  }

  async findAll(queryDto: QueryDiscountDto) {
    try {
      const { page = 1, limit = 10, search, isActive } = queryDto;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.code = { contains: search, mode: 'insensitive' };
      }
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const [discounts, total] = await Promise.all([
        this.prisma.discount.findMany({
          where,
          skip,
          take: limit,
          include: {
            _count: {
              select: { orders: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.discount.count({ where }),
      ]);

      return {
        data: discounts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'fetching discounts' });
    }
  }

  async findOne(id: number) {
    try {
      const discount = await this.prisma.discount.findUnique({
        where: { id },
        include: {
          orders: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: { orders: true },
          },
        },
      });

      if (!discount) {
        throw new NotFoundException(`Discount with ID ${id} not found`);
      }

      return discount;
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'fetching discount' });
    }
  }

  async findByCode(code: string) {
    try {
      const discount = await this.prisma.discount.findUnique({
        where: { code },
        include: {
          _count: {
            select: { orders: true },
          },
        },
      });

      if (!discount) {
        throw new NotFoundException(`Discount code '${code}' not found`);
      }

      return discount;
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'fetching discount' });
    }
  }

  async update(id: number, updateDiscountDto: UpdateDiscountDto) {
    try {
      const discount = await this.prisma.discount.findUnique({
        where: { id },
      });

      if (!discount) {
        throw new NotFoundException(`Discount with ID ${id} not found`);
      }

      // Check if code is being updated and if it conflicts
      if (updateDiscountDto.code && updateDiscountDto.code !== discount.code) {
        const existing = await this.prisma.discount.findUnique({
          where: { code: updateDiscountDto.code },
        });

        if (existing) {
          throw new ConflictException(
            `Discount code '${updateDiscountDto.code}' already exists`,
          );
        }
      }

      const updateData: any = { ...updateDiscountDto };
      if (updateDiscountDto.value !== undefined) {
        updateData.value = Number(updateDiscountDto.value);
      }
      if (updateDiscountDto.minOrderTotal !== undefined) {
        updateData.minOrderTotal = updateDiscountDto.minOrderTotal
          ? Number(updateDiscountDto.minOrderTotal)
          : null;
      }
      if (updateDiscountDto.expiresAt !== undefined) {
        updateData.expiresAt = updateDiscountDto.expiresAt
          ? new Date(updateDiscountDto.expiresAt)
          : null;
      }

      return await this.prisma.discount.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'updating discount' });
    }
  }

  async remove(id: number) {
    try {
      const discount = await this.prisma.discount.findUnique({
        where: { id },
      });

      if (!discount) {
        throw new NotFoundException(`Discount with ID ${id} not found`);
      }

      await this.prisma.discount.delete({
        where: { id },
      });

      return { message: 'Discount deleted successfully' };
    } catch (error) {
      return this.errorHandler.handleError(error, { operation: 'deleting discount' });
    }
  }

  async validateDiscount(code: string, orderTotal: number) {
    try {
      const discount = await this.prisma.discount.findUnique({
        where: { code },
      });

      if (!discount) {
        return {
          valid: false,
          message: 'Discount code not found',
        };
      }

      if (!discount.isActive) {
        return {
          valid: false,
          message: 'Discount code is not active',
        };
      }

      if (discount.expiresAt && discount.expiresAt < new Date()) {
        return {
          valid: false,
          message: 'Discount code has expired',
        };
      }

      if (discount.maxUses && discount.currentUses >= discount.maxUses) {
        return {
          valid: false,
          message: 'Discount code has reached maximum uses',
        };
      }

      if (
        discount.minOrderTotal &&
        orderTotal < Number(discount.minOrderTotal)
      ) {
        return {
          valid: false,
          message: `Minimum order total of ${discount.minOrderTotal} required`,
        };
      }

      return {
        valid: true,
        discount,
      };
    } catch (error) {
      return this.errorHandler.handleError(
        error,
        { operation: 'validating discount' },
      );
    }
  }
}

