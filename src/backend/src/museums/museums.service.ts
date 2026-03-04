import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Museum, MuseumDocument } from './schemas/museum.schema';
import { CreateMuseumDto } from './dto/create-museum.dto';
import { UpdateMuseumDto } from './dto/update-museum.dto';
import { QueryMuseumDto } from './dto/query-museum.dto';

@Injectable()
export class MuseumsService {
  constructor(
    @InjectModel(Museum.name) private museumModel: Model<MuseumDocument>,
  ) {}

  async create(createMuseumDto: CreateMuseumDto): Promise<MuseumDocument> {
    const museum = new this.museumModel(createMuseumDto);
    return museum.save();
  }

  async findAll(query: QueryMuseumDto) {
    const {
      page = 1,
      limit = 10,
      keyword,
      city,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive,
      isFeatured,
    } = query;

    // 构建过滤条件
    const filter: any = {};

    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    // 构建排序
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 执行分页查询
    const skip = (page - 1) * limit;
    const [list, total] = await Promise.all([
      this.museumModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-detailedDescription -introduction')
        .exec(),
      this.museumModel.countDocuments(filter),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<MuseumDocument> {
    const museum = await this.museumModel.findById(id);
    if (!museum) {
      throw new NotFoundException('博物馆不存在');
    }
    // 增加浏览次数
    await this.museumModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    return museum;
  }

  async update(
    id: string,
    updateMuseumDto: UpdateMuseumDto,
  ): Promise<MuseumDocument> {
    const museum = await this.museumModel
      .findByIdAndUpdate(id, updateMuseumDto, { new: true })
      .exec();

    if (!museum) {
      throw new NotFoundException('博物馆不存在');
    }
    return museum;
  }

  async remove(id: string): Promise<void> {
    const result = await this.museumModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('博物馆不存在');
    }
  }

  async incrementFavorite(id: string, increment: number = 1): Promise<void> {
    await this.museumModel.findByIdAndUpdate(id, {
      $inc: { favoriteCount: increment },
    });
  }

  async updateRating(
    id: string,
    rating: number,
    isNewRating: boolean = true,
  ): Promise<void> {
    const museum = await this.museumModel.findById(id);
    if (!museum) return;

    const currentAverage = museum.rating.average;
    const currentCount = museum.rating.count;

    let newAverage: number;
    let newCount: number;

    if (isNewRating) {
      newCount = currentCount + 1;
      newAverage = (currentAverage * currentCount + rating) / newCount;
    } else {
      // 更新评分
      newCount = currentCount;
      newAverage = (currentAverage * currentCount + rating) / newCount;
    }

    await this.museumModel.findByIdAndUpdate(id, {
      $set: {
        rating: {
          average: Math.round(newAverage * 10) / 10,
          count: newCount,
        },
      },
    });
  }

  async getFeatured(limit: number = 5): Promise<MuseumDocument[]> {
    return this.museumModel
      .find({ isFeatured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getByCity(city: string, limit: number = 10): Promise<MuseumDocument[]> {
    return this.museumModel
      .find({ city: { $regex: city, $options: 'i' }, isActive: true })
      .sort({ viewCount: -1 })
      .limit(limit)
      .exec();
  }
}