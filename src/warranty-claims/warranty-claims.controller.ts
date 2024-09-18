import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateWarrantyClaimDto } from 'src/dto/warranty-claims/create-warranty-claims.dto';
import { UpdateWarrantyClaimStatusDto } from 'src/dto/warranty-claims/update-warranty-claim-status.dto';
import { ProductsService } from 'src/products/products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WarrantyClaimsService } from './warranty-claims.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('warranty-claims')
export class WarrantyClaimsController {
  constructor(
    private readonly warrantyClaimsService: WarrantyClaimsService,
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) {}

  // create new warrany claim [customer only]
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async createWarrantyClaim(
    @Body() createWarrantyClaimDto: CreateWarrantyClaimDto,
    @Req() req,
  ) {
    const userId = req.user.userId;
    const newClaim = await this.warrantyClaimsService.create(
      createWarrantyClaimDto,
      userId,
    );

    const product = await this.productsService.findOne(
      createWarrantyClaimDto.product_id,
    );

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    return {
      id: newClaim.id,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseInt(`${product.price}`, 10),
        image_url: `${this.configService.get<string>('PRODUCT_BASEURI')}${product.image}`,
        warranty_expire_at: product.warranty_expire_at,
      },
      remarks: newClaim.remarks,
      status: newClaim.status,
      created_at: newClaim.created_at,
      updated_at: newClaim.updated_at,
    };
  }

  // update status claim [staff only]
  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateWarrantyClaimStatusDto: UpdateWarrantyClaimStatusDto,
  ) {
    const updatedClaim = await this.warrantyClaimsService.updateStatus(
      id,
      updateWarrantyClaimStatusDto.status,
    );

    if (!updatedClaim) {
      throw new HttpException('Warranty claim not found', HttpStatus.NOT_FOUND);
    }
    const product = updatedClaim.product_id;

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    return {
      id: updatedClaim.id,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseInt(`${product.price}`, 10),
        image_url: `${this.configService.get<string>('PRODUCT_BASEURI')}${product.image}`,
        warranty_expire_at: product.warranty_expire_at,
      },
      remarks: updatedClaim.remarks,
      status: updatedClaim.status,
      created_at: updatedClaim.created_at,
      updated_at: updatedClaim.updated_at,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.warrantyClaimsService.findAll(page, limit);
  }

  @Get('my-claims')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async getMyClaims(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Req() req,
  ) {
    const userId = req.user.userId;

    return this.warrantyClaimsService.findClaimsByUserId(userId, page, limit);
  }
}
