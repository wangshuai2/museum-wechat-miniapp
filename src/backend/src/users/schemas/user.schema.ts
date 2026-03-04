import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop()
  avatar?: string;

  @Prop({ enum: ['user', 'admin', 'super_admin'], default: 'user' })
  role: string;

  @Prop({ enum: ['active', 'inactive', 'banned'], default: 'active' })
  status: string;

  @Prop({
    type: {
      nickname: String,
      gender: { type: String, enum: ['male', 'female', 'other'] },
      birthday: Date,
      address: String,
    },
    default: {},
  })
  profile: {
    nickname?: string;
    gender?: string;
    birthday?: Date;
    address?: string;
  };

  @Prop({
    type: {
      language: { type: String, default: 'zh-CN' },
      notifications: { type: Boolean, default: true },
    },
    default: {},
  })
  preferences: {
    language: string;
    notifications: boolean;
  };

  @Prop({
    type: {
      totalMuseums: { type: Number, default: 0 },
      totalVisits: { type: Number, default: 0 },
      totalCities: { type: Number, default: 0 },
    },
    default: { totalMuseums: 0, totalVisits: 0, totalCities: 0 },
  })
  statistics: {
    totalMuseums: number;
    totalVisits: number;
    totalCities: number;
  };

  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 创建索引
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });