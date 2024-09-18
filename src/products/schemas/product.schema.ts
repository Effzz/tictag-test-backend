import { Schema, Document } from 'mongoose';

export const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String },
    warranty_expire_at: { type: String, required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export interface Product extends Document {
  id: string;
  name: string;
  description: string;
  price: string | number;
  image?: string;
  warranty_expire_at: string;
  created_at: Date;
  updated_at: Date;
}
