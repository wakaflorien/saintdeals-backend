import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
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

@ApiTags('Brand')
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Brand with this name already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create Brand DTO',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'BrandName' },
        slug: { type: 'string', example: 'brand-name' },
        description: { type: 'string', example: 'Brand description' },
        isActive: { type: 'boolean', example: true },
        imageFile: {
          type: 'string',
          format: 'binary',
          description: 'Brand image file',
        },
      },
      required: ['name', 'slug'],
    },
  })
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.brandService.create(createBrandDto, imageFile);
  }

  @Get()
  @ApiQuery({ type: QueryBrandDto })
  @ApiOperation({ summary: 'Get all brands with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of brands retrieved successfully',
  })
  async findAll(@Query() query: QueryBrandDto) {
    return this.brandService.findAll(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number, description: 'Brand ID' })
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiResponse({
    status: 200,
    description: 'Brand retrieved successfully',
  })
  async findOne(@Param('id') id: number) {
    return this.brandService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiParam({ name: 'slug', type: String, description: 'Brand slug' })
  @ApiOperation({ summary: 'Get brand by slug' })
  @ApiResponse({
    status: 200,
    description: 'Return brand data',
  })
  async findBySlug(@Param('slug') slug: string) {
    return this.brandService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'Brand ID' })
  @ApiOperation({ summary: 'Update brand by ID' })
  @ApiResponse({
    status: 200,
    description: 'Brand updated successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update Brand DTO',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'UpdatedBrandName' },
        slug: { type: 'string', example: 'updated-brand-name' },
        description: { type: 'string', example: 'Updated brand description' },
        isActive: { type: 'boolean', example: false },
        imageFile: {
          type: 'string',
          format: 'binary',
          description: 'Brand image file (optional - add or update image)',
        },
      },
    },
  })
  async update(
    @Param('id') id: number,
    @Body() updateBrandDto: Partial<CreateBrandDto>,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.brandService.update(id, updateBrandDto, imageFile);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'Brand ID' })
  @ApiOperation({ summary: 'Delete brand by ID' })
  @ApiResponse({
    status: 200,
    description: 'Brand deleted successfully',
  })
  async remove(@Param('id') id: number) {
    return this.brandService.remove(id);
  }
}
