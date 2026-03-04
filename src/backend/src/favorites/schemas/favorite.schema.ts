import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true })
export class Favorite {
  // === 关联字段 ===
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['museum', 'exhibit', 'exhibition'],
    index: true,
  })
  targetType: string;

  @Prop({ type: Types.ObjectId, required: true, refPath: 'targetType' })
  targetId: Types.ObjectId;

  // === 状态字段 ===
  @Prop({
    type: String,
    enum: ['want', 'visited'],
    default: 'want',
  })
  status: string;

  @Prop({ type: String, maxlength: 200 })
  note?: string;

  @Prop({ type: Number, default: 0 })
  sortOrder: number;

  // === 冗余字段（优化查询） ===
  @Prop({ type: String, required: true })
  targetName: string;

  @Prop({ type: String })
  targetImage?: string;

  @Prop({ type: String })
  targetAddress?: string;

  @Prop({ type: [String], default: [] })
  targetTags?: string[];
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

// 唯一索引：同一用户不能重复收藏同一目标
FavoriteSchema.index(
  { userId: 1, targetType: 1, targetId: 1 },
  { unique: true },
);

// 查询索引
FavoriteSchema.index({ userId: 1, createdAt: -1 });
FavoriteSchema.index({ userId: 1, targetType: 1, status: 1 });
FavoriteSchema.index({ userId: 1, sortOrder: 1 });
FavoriteSchema.index({ targetId: 1 });