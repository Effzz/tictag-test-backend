import { Schema, Document } from 'mongoose';
import { Role } from 'src/enum/role.enum';

export const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export interface User extends Document {
  id: string;
  username: string;
  password: string;
  full_name: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
}
