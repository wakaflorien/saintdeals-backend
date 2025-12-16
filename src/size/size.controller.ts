import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { SizeService } from './size.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';

@ApiTags('Sizes')
@ApiBearerAuth()
@Controller('sizes')
export class SizeController {
  constructor(private readonly sizesService: SizeService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new size or multiple sizes',
    description: 'Accepts single size object or an array of sizes',
  })
  @ApiResponse({ status: 201, description: 'Sizes created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Duplicate or existing sizes found',
  })
  create(@Body() createSizeDto: CreateSizeDto) {
    return this.sizesService.create(createSizeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sizes with optional filters' })
  @ApiQuery({ name: 'system', required: false, example: 'US' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'skip', required: false, example: 0 })
  @ApiQuery({ name: 'take', required: false, example: 50 })
  findAll(
    @Query('system') system?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.sizesService.findAll({
      system,
      search,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
    });
  }

  @Get('systems')
  @ApiOperation({ summary: 'Get all sizing systems (US, EU, UK, etc.)' })
  getSizingSystems() {
    return this.sizesService.getSizingSystems();
  }

  @Get('system/:system')
  @ApiOperation({ summary: 'Get all sizes for a specific system' })
  findBySystem(@Param('system') system: string) {
    return this.sizesService.findBySystem(system);
  }

  @Get(':identifier')
  @ApiOperation({ summary: 'Get a size by ID or sizeValue' })
  findOne(@Param('identifier') identifier: string) {
    return this.sizesService.findOne(identifier);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a size by ID' })
  update(@Param('id') id: number, @Body() updateSizeDto: UpdateSizeDto) {
    return this.sizesService.update(+id, updateSizeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a size by ID' })
  remove(@Param('id') id: number) {
    return this.sizesService.remove(+id);
  }
}
