import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { QueryFavoriteDto } from './dto/query-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name)
    private favoriteModel: Model<FavoriteDocument>,
  ) {}

  // 添加收藏
  async create(
    userId: string,
    createFavoriteDto: CreateFavoriteDto,
    targetInfo?: {
      name: string;
      image?: string;
      address?: string;
      tags?: string[];
    },
  ): Promise<FavoriteDocument> {
    const { targetType, targetId, status, note } = createFavoriteDto;

    // 检查是否已收藏
    const existing = await this.favoriteModel.findOne({
      userId: new Types.ObjectId(userId),
      targetType,
      targetId: new Types.ObjectId(targetId),
    });

    if (existing) {
      throw new ConflictException('已收藏该内容');
    }

    const favoriteData: any = {
      userId: new Types.ObjectId(userId),
      targetType,
      targetId: new Types.ObjectId(targetId),
      status: status || 'want',
      note,
      targetName: targetInfo?.name || '',
      targetImage: targetInfo?.image,
      targetAddress: targetInfo?.address,
      targetTags: targetInfo?.tags || [],
    };

    const favorite = new this.favoriteModel(favoriteData);
    return favorite.save();
  }

  // 获取我的收藏
  async findMy(
    userId: string,
    query: QueryFavoriteDto,
  ): Promise<{
    list: FavoriteDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: {
      museumTotal: number;
      museumWant: number;
      museumVisited: number;
      exhibitTotal: number;
    };
  }> {
    const { page = 1, limit = 10, targetType, status, museumId } = query;
    const skip = (page - 1) * limit;

    const filter: any = { userId: new Types.ObjectId(userId) };

    if (targetType) {
      filter.targetType = targetType;
    }
    if (status) {
      filter.status = status;
    }
    if (museumId) {
      filter.targetId = new Types.ObjectId(museumId);
    }

    const [list, total, museumTotal, museumWant, museumVisited, exhibitTotal] =
      await Promise.all([
        this.favoriteModel
          .find(filter)
          .sort({ sortOrder: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.favoriteModel.countDocuments(filter),
        this.favoriteModel.countDocuments({
          userId: new Types.ObjectId(userId),
          targetType: 'museum',
        }),
        this.favoriteModel.countDocuments({
          userId: new Types.ObjectId(userId),
          targetType: 'museum',
          status: 'want',
        }),
        this.favoriteModel.countDocuments({
          userId: new Types.ObjectId(userId),
          targetType: 'museum',
          status: 'visited',
        }),
        this.favoriteModel.countDocuments({
          userId: new Types.ObjectId(userId),
          targetType: 'exhibit',
        }),
      ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary: {
        museumTotal,
        museumWant,
        museumVisited,
        exhibitTotal,
      },
    };
  }

  // 检查收藏状态
  async checkFavorite(
    userId: string,
    targetType: string,
    targetId: string,
  ): Promise<{
    isFavorited: boolean;
    favoriteId?: string;
    status?: string;
    note?: string;
  }> {
    const favorite = await this.favoriteModel.findOne({
      userId: new Types.ObjectId(userId),
      targetType,
      targetId: new Types.ObjectId(targetId),
    });

    if (!favorite) {
      return { isFavorited: false };
    }

    return {
      isFavorited: true,
      favoriteId: favorite._id.toString(),
      status: favorite.status,
      note: favorite.note,
    };
  }

  // 更新收藏状态
  async update(
    id: string,
    userId: string,
    updateFavoriteDto: UpdateFavoriteDto,
  ): Promise<FavoriteDocument> {
    const favorite = await this.favoriteModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        updateFavoriteDto,
        { new: true },
      )
      .exec();

    if (!favorite) {
      throw new NotFoundException('收藏不存在或无权限修改');
    }

    return favorite;
  }

  // 取消收藏
  async remove(id: string, userId: string): Promise<void> {
    const result = await this.favoriteModel
      .findOneAndDelete({
        _id: id,
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!result) {
      throw new NotFoundException('收藏不存在或无权限删除');
    }
  }

  // 批量删除
  async batchDelete(ids: string[], userId: string): Promise<number> {
    const result = await this.favoriteModel.deleteMany({
      _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
      userId: new Types.ObjectId(userId),
    });

    return result.deletedCount;
  }

  // 批量更新状态
  async batchUpdateStatus(
    ids: string[],
    userId: string,
    status: 'want' | 'visited',
  ): Promise<number> {
    const result = await this.favoriteModel.updateMany(
      {
        _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
        userId: new Types.ObjectId(userId),
      },
      { $set: { status } },
    );

    return result.modifiedCount;
  }

  // 更新排序
  async updateSortOrder(
    userId: string,
    orders: { id: string; sortOrder: number }[],
  ): Promise<void> {
    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(item.id),
          userId: new Types.ObjectId(userId),
        },
        update: { $set: { sortOrder: item.sortOrder } },
      },
    }));

    await this.favoriteModel.bulkWrite(bulkOps);
  }

  // 获取收藏统计
  async getStatistics(userId: string): Promise<{
    total: number;
    museumTotal: number;
    exhibitTotal: number;
    wantCount: number;
    visitedCount: number;
    topMuseums: { name: string; exhibitCount: number }[];
  }> {
    const stats = await this.favoriteModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          museumTotal: {
            $sum: { $cond: [{ $eq: ['$targetType', 'museum'] }, 1, 0] },
          },
          exhibitTotal: {
            $sum: { $cond: [{ $eq: ['$targetType', 'exhibit'] }, 1, 0] },
          },
          wantCount: {
            $sum: { $cond: [{ $eq: ['$status', 'want'] }, 1, 0] },
          },
          visitedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'visited'] }, 1, 0] },
          },
        },
      },
    ]);

    // 获取收藏最多的博物馆（按展品收藏数）
    const topMuseums = await this.favoriteModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          targetType: 'exhibit',
        },
      },
      {
        $group: {
          _id: '$targetId',
          name: { $first: '$targetName' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    if (stats.length === 0) {
      return {
        total: 0,
        museumTotal: 0,
        exhibitTotal: 0,
        wantCount: 0,
        visitedCount: 0,
        topMuseums: [],
      };
    }

    return {
      total: stats[0].total,
      museumTotal: stats[0].museumTotal,
      exhibitTotal: stats[0].exhibitTotal,
      wantCount: stats[0].wantCount,
      visitedCount: stats[0].visitedCount,
      topMuseums: topMuseums.map((m) => ({
        name: m.name,
        exhibitCount: m.count,
      })),
    };
  }

  // 获取目标的收藏数量
  async countByTarget(
    targetType: string,
    targetId: string,
  ): Promise<number> {
    return this.favoriteModel.countDocuments({
      targetType,
      targetId: new Types.ObjectId(targetId),
    });
  }
}