import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Footprint, FootprintDocument } from './schemas/footprint.schema';
import { CreateFootprintDto } from './dto/create-footprint.dto';

@Injectable()
export class FootprintsService {
  constructor(
    @InjectModel(Footprint.name)
    private footprintModel: Model<FootprintDocument>,
  ) {}

  async create(
    userId: string,
    createFootprintDto: CreateFootprintDto,
  ): Promise<FootprintDocument> {
    const footprint = new this.footprintModel({
      ...createFootprintDto,
      userId: new Types.ObjectId(userId),
      museumId: new Types.ObjectId(createFootprintDto.museumId),
    });

    return footprint.save();
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    list: FootprintDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [list, total] = await Promise.all([
      this.footprintModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ visitDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('museumId', 'name coverImage city address')
        .exec(),
      this.footprintModel.countDocuments({
        userId: new Types.ObjectId(userId),
      }),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByMuseumId(
    museumId: string,
    page: number = 1,
    limit: number = 10,
    publicOnly: boolean = true,
  ): Promise<{
    list: FootprintDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const filter: any = { museumId: new Types.ObjectId(museumId) };

    if (publicOnly) {
      filter.isPublic = true;
    }

    const [list, total] = await Promise.all([
      this.footprintModel
        .find(filter)
        .sort({ visitDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username avatar')
        .exec(),
      this.footprintModel.countDocuments(filter),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId?: string): Promise<FootprintDocument> {
    const footprint = await this.footprintModel
      .findById(id)
      .populate('museumId', 'name coverImage city address')
      .populate('userId', 'username avatar')
      .exec();

    if (!footprint) {
      throw new NotFoundException('足迹不存在');
    }

    // 检查权限：非公开足迹只有创建者可查看
    if (!footprint.isPublic && userId && footprint.userId._id.toString() !== userId) {
      throw new NotFoundException('足迹不存在');
    }

    return footprint;
  }

  async update(
    id: string,
    userId: string,
    updateData: Partial<CreateFootprintDto>,
  ): Promise<FootprintDocument> {
    const footprint = await this.footprintModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        updateData,
        { new: true },
      )
      .exec();

    if (!footprint) {
      throw new NotFoundException('足迹不存在或无权限修改');
    }

    return footprint;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.footprintModel
      .findOneAndDelete({
        _id: id,
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!result) {
      throw new NotFoundException('足迹不存在或无权限删除');
    }
  }

  async getStatistics(userId: string): Promise<{
    totalVisits: number;
    uniqueMuseums: number;
    avgRating: number;
    recentVisits: number;
  }> {
    const stats = await this.footprintModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          uniqueMuseums: { $addToSet: '$museumId' },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    // 最近30天访问数
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentVisits = await this.footprintModel.countDocuments({
      userId: new Types.ObjectId(userId),
      visitDate: { $gte: thirtyDaysAgo },
    });

    if (stats.length === 0) {
      return {
        totalVisits: 0,
        uniqueMuseums: 0,
        avgRating: 0,
        recentVisits: 0,
      };
    }

    return {
      totalVisits: stats[0].totalVisits,
      uniqueMuseums: stats[0].uniqueMuseums.length,
      avgRating: Math.round(stats[0].avgRating * 10) / 10 || 0,
      recentVisits,
    };
  }

  async checkIfVisited(userId: string, museumId: string): Promise<boolean> {
    const count = await this.footprintModel.countDocuments({
      userId: new Types.ObjectId(userId),
      museumId: new Types.ObjectId(museumId),
    });
    return count > 0;
  }
}