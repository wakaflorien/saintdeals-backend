import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { ErrorHandlerService } from 'src/common/error-handler.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';

@Injectable()
export class BrandService {
  private prisma = new PrismaClient();

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  async create(brandData: CreateBrandDto, imageFile?: Express.Multer.File) {
    try {
      if (!brandData.name?.trim()) {
        this.errorHandler.handleError('Brand name is required');
      }

      if (!brandData.slug?.trim()) {
        this.errorHandler.handleError('Brand slug is required');
      }

      const existingBrand = await this.prisma.brand.findUnique({
        where: { name: brandData.name },
      });

      if (existingBrand) {
        throw new BadRequestException('Brand with this name already exists');
      }

      let logo: string | undefined;
      if (imageFile) {
        try {
          logo = await this.cloudinaryService.uploadImage(imageFile);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          throw new BadRequestException(
            'Failed to upload brand image. Please check the image file or try again.',
          );
        }
      }

      const brand = await this.prisma.brand.create({
        data: {
          ...brandData,
          logo,
          isActive: Boolean(brandData.isActive),
        },
      });

      return { message: 'Brand created successfully', data: brand };
    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }

  async findAll(query?: QueryBrandDto) {
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

      const brands = await this.prisma.brand.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        orderBy: { createdAt: 'desc' },
      });

      return { message: 'Brands Retrieved Successfully', data: brands };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'retrieving brands',
        knownExceptions: [BadRequestException],
      });
    }
  }

  async findOne(id: number) {
    return this.prisma.brand.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.prisma.brand.findUnique({ where: { slug } });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    await this.prisma.brand.delete({ where: { id } });
    return { message: 'Brand Deleted Successfully' };
  }

  async update(
    id: number,
    brandData: Partial<CreateBrandDto>,
    imageFile?: Express.Multer.File,
  ) {
    try {
      const brand = await this.prisma.brand.findUnique({ where: { id } });
      if (!brand) {
        throw new BadRequestException('Brand not found');
      }

      const updateFields: Partial<{
        name: string;
        slug: string;
        description: string;
        isActive: boolean;
        logo: string;
      }> = {};

      if (brandData.name !== undefined) {
        updateFields.name = brandData.name;
      }
      if (brandData.slug !== undefined) {
        updateFields.slug = brandData.slug;
      }
      if (brandData.description !== undefined) {
        updateFields.description = brandData.description;
      }
      if (brandData.isActive !== undefined) {
        updateFields.isActive = Boolean(brandData.isActive);
      }

      if (imageFile) {
        try {
          const imageUrl = await this.cloudinaryService.uploadImage(imageFile);
          updateFields.logo = imageUrl;
        } catch (uploadError) {
          console.error('Logo upload failed:', uploadError);
          throw new BadRequestException(
            'Failed to upload logo image. Please check the image file or try again.',
          );
        }
      }

      if (Object.keys(updateFields).length === 0) {
        throw new BadRequestException('No valid fields provided for update');
      }
      const updatedBrand = await this.prisma.brand.update({
        where: { id },
        data: updateFields,
      });

      return { message: 'Brand Updated Successfully', data: updatedBrand };
    } catch (error) {
      this.errorHandler.handleError(error, {
        operation: 'updating brand',
        knownExceptions: [BadRequestException],
        prismaErrorMap: {
          P2002: 'Brand with this name or slug already exists',
        },
      });
    }
  }
}
