import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { PrismaService } from '../prisma/prisma.service';
import { SizeHelper } from './size.helper';

@Injectable()
export class SizeService {
  constructor(private prisma: PrismaService) {}

async create(createSizeDto: CreateSizeDto ) {
  // const sizes = Array.isArray(createSizeDto) ? createSizeDto : [createSizeDto];

  // // 1️ Validate duplicates in input
  // const sizeValues = sizes.map((s) => s.sizeValue);
  // const duplicates = [...new Set(sizeValues.filter((v, i, arr) => arr.indexOf(v) !== i))];
  // if (duplicates.length > 0) {
  //   throw new ConflictException(`Duplicate sizes in request: ${duplicates.join(', ')}`);
  // }

  // // 2️ Check existing records in DB
  // const existing = await this.prisma.size.findMany({
  //   where: { sizeValue: { in: sizeValues } },
  //   select: { sizeValue: true },
  // });

  // if (existing.length > 0) {
  //   const existingValues = existing.map((e) => e.sizeValue).join(', ');
  //   throw new ConflictException(`Some sizes already exist: ${existingValues}`);
  // }

  // // 3️ Prepare data with system derived
  // const data = sizes.map((s) => ({
  //   ...s,
  //   system: SizeHelper.getSystemFromSizeValue(s.sizeValue),
  // }));

  // // 4️ Create
  // if (Array.isArray(createSizeDto)) {
  //   const created = await this.prisma.size.createMany({ data });
  //   return {
  //     message: `${created.count} sizes created successfully`,
  //     data: { count: created.count },
  //   };
  // }

  // const size = await this.prisma.size.create({ data: data[0] });



// check if size already exists

const existingSize = await this.prisma.size.findUnique({
    where: { sizeValue: createSizeDto.sizeValue },
  });

  if (existingSize) {
    throw new ConflictException(
      `Size ${createSizeDto.sizeValue} already exists`,
    );
  }

  const size = await this.prisma.size.create({
    data: {
      ...createSizeDto,
      system: SizeHelper.getSystemFromSizeValue(createSizeDto.sizeValue),
    },
  });


  return {
    message: 'Size created successfully',
    data: size,
  };
}


  async findAll(params?: {
    system?: string;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const { system, search, skip = 0, take = 50 } = params || {};

    const where: any = {};

    // Filter by sizing system (US, EU, UK)
    if (system) {
      where.system = system;
    }

    // Search in display value or system
    if (search) {
      where.OR = [
        { displayValue: { contains: search, mode: 'insensitive' } },
        { system: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [sizes, total] = await Promise.all([
      this.prisma.size.findMany({
        where,
        skip,
        take,
        orderBy: [
          { system: 'asc' },
          { sizeValue: 'asc' },
        ],
        // include: {
        //   _count: {
        //     select: { productVariants: true },
        //   },
        // },
      }),
      this.prisma.size.count({ where }),
    ]);

    return {
      data: sizes,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(identifier: string | number) {
    // Find by ID or sizeValue
    const isNumericId = !isNaN(Number(identifier));
    
    const size = await this.prisma.size.findFirst({
      where: isNumericId 
        ? { id: Number(identifier) }
        : { sizeValue: identifier as any },
      // include: {
      //   _count: {
      //     select: { productVariants: true },
      //   },
      // },
    });

    if (!size) {
      throw new NotFoundException(
        `Size with identifier '${identifier}' not found`,
      );
    }

    return {
      data: size,
    };
  }

  async findBySystem(system: string) {
    const sizes = await this.prisma.size.findMany({
      where: { system },
      orderBy: { sizeValue: 'asc' },
      // include: {
      //   _count: {
      //     select: { productVariants: true },
      //   },
      // },
    });

    return {
      data: sizes,
      meta: {
        total: sizes.length,
        system,
      },
    };
  }

  async update(id: number, updateSizeDto: UpdateSizeDto) {
    // Check if size exists
    const existingSize = await this.prisma.size.findUnique({
      where: { id },
    });

    if (!existingSize) {
      throw new NotFoundException(`Size with ID '${id}' not found`);
    }

    // Check for conflicts with other sizes if updating sizeValue
    if (updateSizeDto.sizeValue) {
      const conflictingSize = await this.prisma.size.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { sizeValue: updateSizeDto.sizeValue },
          ],
        },
      });

      if (conflictingSize) {
        throw new ConflictException(
          `Size ${updateSizeDto.sizeValue} already exists`,
        );
      }
    }

    const size = await this.prisma.size.update({
      where: { id },
      data: {
        ...updateSizeDto,
        system: updateSizeDto.sizeValue 
          ? SizeHelper.getSystemFromSizeValue(updateSizeDto.sizeValue)  
          : existingSize.system,
      }
    });

    return {
      message: 'Size updated successfully',
      data: size,
    };
  }

  async remove(id: number) {
    // Check if size exists
    const size = await this.prisma.size.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productVariants: true },
        },
      },
    });

    if (!size) {
      throw new NotFoundException(`Size with ID '${id}' not found`);
    }

    // Check if size has product variants
    if (size._count.productVariants > 0) {
      throw new ConflictException(
        `Cannot delete size with ${size._count.productVariants} associated product variants. Remove or reassign variants first.`,
      );
    }

    await this.prisma.size.delete({
      where: { id },
    });

    return {
      message: 'Size deleted successfully',
    };
  }

  async getSizingSystems() {
    // Get unique sizing systems
    const sizes = await this.prisma.size.findMany({
      select: { system: true },
      distinct: ['system'],
      orderBy: { system: 'asc' },
    });

    const systems = sizes.map((s) => s.system);

    return {
      data: systems,
      meta: {
        total: systems.length,
      },
    };
  }
}