import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateProductDto } from 'src/dto/products/create-product.dto';
import { UpdateProductDto } from 'src/dto/products/update-product.dto';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { promisify } from 'util';
import { unlink } from 'fs';

const unlinkAsync = promisify(unlink);

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const fileExtension = extname(file.originalname);
          const filename = `${Date.now()}${fileExtension}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      createProductDto.image = file.filename;
    }
    if (createProductDto.warranty_expire_at) {
      createProductDto.warranty_expire_at = new Date(
        createProductDto.warranty_expire_at,
      ).toISOString();
    }
    const product = await this.productsService.create(createProductDto);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseInt(`${product.price}`, 10),
      image_url: `${this.configService.get<string>('PRODUCT_BASEURI')}${product.image}`,
      warranty_expire_at: product.warranty_expire_at,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const fileExtension = extname(file.originalname);
          const filename = `${Date.now()}${fileExtension}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateProductDto.image = file.filename;
    }
    if (updateProductDto.warranty_expire_at) {
      updateProductDto.warranty_expire_at = new Date(
        updateProductDto.warranty_expire_at,
      ).toISOString();
    }
    const product = await this.productsService.update(id, updateProductDto);
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseInt(`${product.price}`, 10),
      image_url: `${this.configService.get<string>('PRODUCT_BASEURI')}${product.image}`,
      warranty_expire_at: product.warranty_expire_at,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff')
  async remove(@Param('id') id: string) {
    const product = await this.productsService.remove(id);
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    if (product.image) {
      const filePath = join(
        __dirname,
        '../../uploads/products/',
        product.image,
      );
      await unlinkAsync(filePath);
    }

    return { message: 'Product deleted successfully' };
  }
}
