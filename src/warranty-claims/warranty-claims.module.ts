import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WarrantyClaimSchema } from 'src/warranty-claims/schemas/warranty-claims.schema';
import { ProductSchema } from 'src/products/schemas/product.schema';
import { WarrantyClaimsController } from './warranty-claims.controller';
import { WarrantyClaimsService } from './warranty-claims.service';
import { ProductsService } from 'src/products/products.service';
import { UserSchema } from 'src/auth/user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'WarrantyClaim', schema: WarrantyClaimSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [WarrantyClaimsController],
  providers: [WarrantyClaimsService, ProductsService],
})
export class WarrantyClaimsModule {}
