import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MuseumDocument = Museum & Document;

@Schema({ timestamps: true })
export class Museum {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String })
  detailedDescription?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: String })
  coverImage?: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: String })
  city?: string;

  @Prop({ type: String })
  province?: string;

  @Prop({ type: String })
  district?: string;

  @Prop({ type: Number })
  latitude?: number;

  @Prop({ type: Number })
  longitude?: number;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String })
  website?: string;

  @Prop({ type: String })
  openingHours?: string;

  @Prop({ type: String })
  ticketInfo?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String })
  category?: string;

  @Prop({ type: Number, default: 0 })
  viewCount: number;

  @Prop({ type: Number, default: 0 })
  favoriteCount: number;

  @Prop({
    type: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    default: { average: 0, count: 0 },
  })
  rating: {
    average: number;
    count: number;
  };

  @Prop({ type: [String], default: [] })
  facilities: string[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: String })
  introduction?: string;

  @Prop({ type: String })
  trafficInfo?: string;

  @Prop({ type: String })
  notice?: string;
}

export const MuseumSchema = SchemaFactory.createForClass(Museum);

// 创建索引
MuseumSchema.index({ name: 'text', description: 'text' });
MuseumSchema.index({ city: 1 });
MuseumSchema.index({ category: 1 });
MuseumSchema.index({ isActive: 1 });
MuseumSchema.index({ viewCount: -1 });
MuseumSchema.index({ 'rating.average': -1 });
MuseumSchema.index({ isFeatured: -1, createdAt: -1 });