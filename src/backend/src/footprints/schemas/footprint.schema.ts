import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FootprintDocument = Footprint & Document;

@Schema({ timestamps: true })
export class Footprint {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Museum', required: true })
  museumId: Types.ObjectId;

  @Prop({ type: String })
  museumName?: string;

  @Prop({ type: Date, required: true })
  visitDate: Date;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({ type: Number, default: 0 })
  rating?: number;

  @Prop({ type: String })
  feelings?: string;

  @Prop({ type: Boolean, default: false })
  isPublic: boolean;

  @Prop({ type: String })
  weather?: string;

  @Prop({ type: String })
  companion?: string;
}

export const FootprintSchema = SchemaFactory.createForClass(Footprint);

// 创建索引
FootprintSchema.index({ userId: 1, visitDate: -1 });
FootprintSchema.index({ userId: 1, museumId: 1 });
FootprintSchema.index({ museumId: 1, visitDate: -1 });
FootprintSchema.index({ visitDate: -1 });