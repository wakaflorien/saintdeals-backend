import {
  ConflictException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { ErrorHandlerService } from 'src/common/error-handler.service';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CategoryService {
  private prisma = new PrismaClient();

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    imageFile?: Express.Multer.File,
  ) {
    try {
      // Validate input data
      if (!createCategoryDto.name?.trim()) {
        throw new BadRequestException('Category name is required');
      }

      if (!createCategoryDto.slug?.trim()) {
        throw new BadRequestException('Category slug is required');
      }

      const existingCategory = await this.prisma.category.findUnique({
        where: { name: createCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }

      let imageUrl: string | undefined;
      if (imageFile) {
        try {
          imageUrl = await this.cloudinaryService.uploadImage(imageFile);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          throw new BadRequestException(
            'Failed to upload category image. Please check the image file or try again.',
          );
        }
      }

      const category = await this.prisma.category.create({
        data: {
          ...createCategoryDto,
          image: imageUrl,
          isActive: Boolean(createCategoryDto.isActive),
        },
      });

      return { message: 'Category Created Successfully', data: category };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'creating category',
        knownExceptions: [ConflictException, BadRequestException],
        prismaErrorMap: {
          P2002: 'Category with this name or slug already exists',
        },
      });
    }
  }

  async findAll(query?: QueryCategoryDto) {
    try {
      interface WhereClause {
        OR?: Array<{
          name?: { contains: string; mode: 'insensitive' };
          slug?: { contains: string; mode: 'insensitive' };
        }>;
        name?: { contains: string; mode: 'insensitive' };
        slug?: { contains: string; mode: 'insensitive' };
      }

      // Validate query parameters
      if (query?.search && query.search.length < 1) {
        throw new BadRequestException(
          'Search term must be at least 1 character long',
        );
      }

      const whereClause: WhereClause = {};

      if (query?.search) {
        whereClause.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { slug: { contains: query.search, mode: 'insensitive' } },
        ];
      } else {
        if (query?.name) {
          whereClause.name = { contains: query.name, mode: 'insensitive' };
        }
        if (query?.slug) {
          whereClause.slug = { contains: query.slug, mode: 'insensitive' };
        }
      }

      const categories = await this.prisma.category.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        orderBy: { createdAt: 'desc' },
      });

      return { message: 'Categories Retrieved Successfully', data: categories };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving categories',
        knownExceptions: [BadRequestException],
      });
    }
  }

  async findOne(id: number) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({ where: { slug } });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category Deleted Successfully' };
  }

  async update(
    id: number,
    updateData: UpdateCategoryDto,
    imageFile?: Express.Multer.File,
  ) {
    try {
      const category = await this.prisma.category.findUnique({ where: { id } });
      if (!category) {
        throw new BadRequestException('Category not found');
      }

      // Prepare update object with only provided fields
      const updateFields: Partial<{
        name: string;
        slug: string;
        description: string;
        isActive: boolean;
        image: string;
      }> = {};

      // Only add fields that are actually provided
      if (updateData.name !== undefined) {
        updateFields.name = updateData.name;
      }
      if (updateData.slug !== undefined) {
        updateFields.slug = updateData.slug;
      }
      if (updateData.description !== undefined) {
        updateFields.description = updateData.description;
      }
      if (updateData.isActive !== undefined) {
        updateFields.isActive = Boolean(updateData.isActive);
      }

      // Handle image upload only if a file is provided
      if (imageFile) {
        try {
          const imageUrl = await this.cloudinaryService.uploadImage(imageFile);
          updateFields.image = imageUrl;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          throw new BadRequestException(
            'Failed to upload category image. Please check the image file or try again.',
          );
        }
      }

      // Only update if there are fields to update
      if (Object.keys(updateFields).length === 0) {
        throw new BadRequestException('No valid fields provided for update');
      }

      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: updateFields,
      });

      return {
        message: 'Category Updated Successfully',
        data: updatedCategory,
      };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'updating category',
        knownExceptions: [BadRequestException],
        prismaErrorMap: {
          P2002: 'Category with this name or slug already exists',
        },
      });
    }
  }
}
