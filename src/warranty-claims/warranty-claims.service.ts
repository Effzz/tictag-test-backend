import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WarrantyClaim } from './schemas/warranty-claims.schema';
import { Product } from 'src/products/schemas/product.schema';
import { CreateWarrantyClaimDto } from 'src/dto/warranty-claims/create-warranty-claims.dto';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/auth/user/user.schema';

@Injectable()
export class WarrantyClaimsService {
  constructor(
    @InjectModel('WarrantyClaim')
    private readonly warrantyClaimModel: Model<WarrantyClaim>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createWarrantyClaimDto: CreateWarrantyClaimDto,
    userId: string,
  ): Promise<WarrantyClaim> {
    const product = await this.productModel
      .findById(createWarrantyClaimDto.product_id)
      .exec();
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    // Check warranty is still valid
    if (new Date(product.warranty_expire_at) < new Date()) {
      throw new HttpException('Warranty expired', HttpStatus.BAD_REQUEST);
    }

    const newClaim = new this.warrantyClaimModel({
      product_id: createWarrantyClaimDto.product_id,
      user_id: userId,
      remarks: createWarrantyClaimDto.remarks,
    });

    return newClaim.save();
  }

  async updateStatus(
    id: string,
    status: 'Pending' | 'Approved' | 'Rejected',
  ): Promise<WarrantyClaim> {
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    const updatedClaim = await this.warrantyClaimModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (!updatedClaim) {
      throw new HttpException('Warranty claim not found', HttpStatus.NOT_FOUND);
    }

    return updatedClaim;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ claims: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const [claims, total] = await Promise.all([
      this.warrantyClaimModel
        .find()
        .skip(skip)
        .limit(limit)
        .populate('product_id')
        .populate('user_id')
        .exec(),
      this.warrantyClaimModel.countDocuments().exec(),
    ]);

    const formattedClaims = await Promise.all(
      claims.map(async (claim) => {
        const product = claim.product_id as Product;
        const user = claim.user_id as User;
        return {
          id: claim.id,
          product: {
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseInt(`${product.price}`, 10),
            image_url: `${this.configService.get<string>('PRODUCT_BASEURI')}${product.image}`,
            warranty_expire_at: product.warranty_expire_at,
          },
          user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
          },
          remarks: claim.remarks,
          status: claim.status,
        };
      }),
    );

    return {
      claims: formattedClaims,
      total,
    };
  }

  async findClaimsByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ claims: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const [claims, total] = await Promise.all([
      this.warrantyClaimModel
        .find({ user_id: userId })
        .skip(skip)
        .limit(limit)
        .populate('product_id')
        .exec(),
      this.warrantyClaimModel.countDocuments({ user_id: userId }).exec(),
    ]);

    if (!claims) {
      throw new HttpException('Claims not found', HttpStatus.NOT_FOUND);
    }

    const formattedClaims = await Promise.all(
      claims.map(async (claim) => {
        const product = claim.product_id as Product;
        return {
          id: claim.id,
          product: {
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseInt(`${product.price}`, 10),
            image_url: `${this.configService.get<string>('PRODUCT_BASEURI')}${product.image}`,
            warranty_expire_at: product.warranty_expire_at,
          },
          remarks: claim.remarks,
          status: claim.status,
        };
      }),
    );

    return {
      claims: formattedClaims,
      total,
    };
  }
}
