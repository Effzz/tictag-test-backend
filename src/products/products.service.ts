// src/products/products.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private readonly configService: ConfigService,
  ) {}

  async create(createProductDto: Partial<Product>): Promise<Product> {
    const newProduct = new this.productModel({
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price,
      image: createProductDto.image,
      warranty_expire_at: new Date(
        createProductDto.warranty_expire_at,
      ).toISOString(),
    });
    return newProduct.save();
  }

  async findOne(id: string): Promise<Product> {
    return this.productModel.findById(id).exec();
  }

  async update(
    id: string,
    updateProductDto: Partial<Product>,
  ): Promise<Product> {
    return this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Product> {
    return this.productModel.findByIdAndDelete(id).exec();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ records: any; total_records: number }> {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel.find().skip(skip).limit(limit).exec(),
      this.productModel.countDocuments().exec(),
    ]);

    return {
      records: products.map((p: Product) => {
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          image_url: `${this.configService.get<string>('PRODUCT_BASEURI')}${p.image}`,
          warranty_expire_at: p.warranty_expire_at,
        };
      }),
      total_records: total,
    };
  }
}
