import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NoteDocument = Note & Document;

@Schema({ timestamps: true })
export class Note {
  // === 关联字段 ===
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Museum', required: true, index: true })
  museumId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exhibit', index: true })
  exhibitId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Footprint' })
  footprintId?: Types.ObjectId;

  // === 内容字段 ===
  @Prop({ trim: true, maxlength: 100 })
  title?: string;

  @Prop({ required: true, maxlength: 5000 })
  content: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  // === 状态字段 ===
  @Prop({ enum: ['private', 'public'], default: 'private' })
  visibility: string;

  @Prop({ type: Number, default: 0, min: 0 })
  likeCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  viewCount: number;

  // === 冗余字段（优化查询） ===
  @Prop({ type: String })
  museumName?: string;

  @Prop({ type: String })
  exhibitName?: string;

  @Prop({ type: String })
  museumImage?: string;

  @Prop({ type: String })
  exhibitImage?: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

// 索引设计
NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ museumId: 1, createdAt: -1 });
NoteSchema.index({ exhibitId: 1, createdAt: -1 }, { sparse: true });
NoteSchema.index({ visibility: 1, createdAt: -1 });
NoteSchema.index({ userId: 1, museumId: 1 });
NoteSchema.index({ userId: 1, exhibitId: 1 }, { sparse: true });
NoteSchema.index({ tags: 1 });
NoteSchema.index({ content: 'text', title: 'text' });