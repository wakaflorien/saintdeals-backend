import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { QueryCategoryDto } from './dto/query-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data provided',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Category creation with optional image upload',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Electronics',
        },
        slug: {
          type: 'string',
          example: 'electronics',
        },
        description: {
          type: 'string',
          example: 'Devices and gadgets',
        },
        isActive: {
          type: 'boolean',
          example: true,
        },
        imageFile: {
          type: 'string',
          format: 'binary',
          description: 'Category image file',
        },
      },
      required: ['name', 'slug'],
    },
  })
  @UseInterceptors(FileInterceptor('imageUrl'))
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    return this.categoryService.create(createCategoryDto, imageFile);
  }

  @Get()
  @ApiQuery({ type: QueryCategoryDto })
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Return all categories',
  })
  async findAll(@Query() query: QueryCategoryDto) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return category data',
  })
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Get('slug/:slug')
  @ApiParam({ name: 'slug', type: String, description: 'Category slug' })
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({
    status: 200,
    description: 'Return category data',
  })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Category update with optional image upload',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Electronics',
        },
        slug: {
          type: 'string',
          example: 'electronics',
        },
        description: {
          type: 'string',
          example: 'Devices and gadgets',
        },
        isActive: {
          type: 'boolean',
          example: true,
        },
        imageFile: {
          type: 'string',
          format: 'binary',
          description: 'Category image file (optional - add or update image)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('imageUrl'))
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    return this.categoryService.update(+id, updateCategoryDto, imageFile);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
