import { Schema, Document } from 'mongoose';
import { Product } from 'src/products/schemas/product.schema';
import { User } from 'src/auth/user/user.schema';

export const WarrantyClaimSchema = new Schema(
  {
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    remarks: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export interface WarrantyClaim extends Document {
  id: string;
  product_id: Product;
  user_id: User;
  remarks: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: Date;
  updated_at: Date;
}
