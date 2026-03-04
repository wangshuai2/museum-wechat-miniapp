import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from './schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNoteDto } from './dto/query-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name)
    private noteModel: Model<NoteDocument>,
  ) {}

  // 创建笔记
  async create(
    userId: string,
    createNoteDto: CreateNoteDto,
    museumInfo?: { name: string; image?: string },
    exhibitInfo?: { name: string; image?: string },
  ): Promise<NoteDocument> {
    const noteData: any = {
      ...createNoteDto,
      userId: new Types.ObjectId(userId),
      museumId: new Types.ObjectId(createNoteDto.museumId),
    };

    // 添加冗余字段
    if (museumInfo) {
      noteData.museumName = museumInfo.name;
      noteData.museumImage = museumInfo.image;
    }
    if (exhibitInfo) {
      noteData.exhibitName = exhibitInfo.name;
      noteData.exhibitImage = exhibitInfo.image;
    }

    if (createNoteDto.exhibitId) {
      noteData.exhibitId = new Types.ObjectId(createNoteDto.exhibitId);
    }
    if (createNoteDto.footprintId) {
      noteData.footprintId = new Types.ObjectId(createNoteDto.footprintId);
    }

    const note = new this.noteModel(noteData);
    return note.save();
  }

  // 获取笔记列表（公开）
  async findAll(query: QueryNoteDto): Promise<{
    list: NoteDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, museumId, exhibitId, tag, keyword, orderBy } = query;
    const skip = (page - 1) * limit;

    const filter: any = { visibility: 'public' };

    if (museumId) {
      filter.museumId = new Types.ObjectId(museumId);
    }
    if (exhibitId) {
      filter.exhibitId = new Types.ObjectId(exhibitId);
    }
    if (tag) {
      filter.tags = tag;
    }
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
      ];
    }

    const sort: any = orderBy === 'popular' ? { likeCount: -1, viewCount: -1 } : { createdAt: -1 };

    const [list, total] = await Promise.all([
      this.noteModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username avatar')
        .populate('museumId', 'name coverImage city address')
        .exec(),
      this.noteModel.countDocuments(filter),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 获取我的笔记
  async findMy(
    userId: string,
    query: QueryNoteDto,
  ): Promise<{
    list: NoteDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, museumId, exhibitId, tag, keyword } = query;
    const skip = (page - 1) * limit;

    const filter: any = { userId: new Types.ObjectId(userId) };

    if (museumId) {
      filter.museumId = new Types.ObjectId(museumId);
    }
    if (exhibitId) {
      filter.exhibitId = new Types.ObjectId(exhibitId);
    }
    if (tag) {
      filter.tags = tag;
    }
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
      ];
    }

    const [list, total] = await Promise.all([
      this.noteModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('museumId', 'name coverImage city address')
        .exec(),
      this.noteModel.countDocuments(filter),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 获取笔记详情
  async findById(id: string, userId?: string): Promise<NoteDocument> {
    const note = await this.noteModel
      .findById(id)
      .populate('userId', 'username avatar')
      .populate('museumId', 'name coverImage city address')
      .exec();

    if (!note) {
      throw new NotFoundException('笔记不存在');
    }

    // 检查权限：私密笔记只有创建者可查看
    if (note.visibility === 'private' && userId && note.userId._id.toString() !== userId) {
      throw new ForbiddenException('无权查看此笔记');
    }

    // 增加浏览数
    await this.noteModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return note;
  }

  // 更新笔记
  async update(
    id: string,
    userId: string,
    updateNoteDto: UpdateNoteDto,
  ): Promise<NoteDocument> {
    const note = await this.noteModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        updateNoteDto,
        { new: true },
      )
      .populate('museumId', 'name coverImage city address')
      .exec();

    if (!note) {
      throw new NotFoundException('笔记不存在或无权限修改');
    }

    return note;
  }

  // 删除笔记
  async remove(id: string, userId: string): Promise<void> {
    const result = await this.noteModel
      .findOneAndDelete({
        _id: id,
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!result) {
      throw new NotFoundException('笔记不存在或无权限删除');
    }
  }

  // 获取笔记统计
  async getStatistics(userId: string): Promise<{
    totalNotes: number;
    totalWords: number;
    totalImages: number;
    museumCount: number;
    exhibitCount: number;
    topTags: { name: string; count: number }[];
    monthlyNotes: { month: string; count: number }[];
  }> {
    const stats = await this.noteModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalNotes: { $sum: 1 },
          totalWords: { $sum: { $strLenCP: '$content' } },
          totalImages: { $sum: { $size: '$images' } },
          uniqueMuseums: { $addToSet: '$museumId' },
          uniqueExhibits: { $addToSet: '$exhibitId' },
        },
      },
    ]);

    // 获取标签统计
    const tagStats = await this.noteModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // 获取月度笔记统计
    const monthlyStats = await this.noteModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    if (stats.length === 0) {
      return {
        totalNotes: 0,
        totalWords: 0,
        totalImages: 0,
        museumCount: 0,
        exhibitCount: 0,
        topTags: [],
        monthlyNotes: [],
      };
    }

    return {
      totalNotes: stats[0].totalNotes,
      totalWords: stats[0].totalWords,
      totalImages: stats[0].totalImages,
      museumCount: stats[0].uniqueMuseums.length,
      exhibitCount: stats[0].uniqueExhibits.filter((id: any) => id).length,
      topTags: tagStats.map((t) => ({ name: t._id, count: t.count })),
      monthlyNotes: monthlyStats.map((m) => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
        count: m.count,
      })),
    };
  }

  // 检查用户在某博物馆是否有笔记
  async checkUserHasNoteInMuseum(
    userId: string,
    museumId: string,
  ): Promise<boolean> {
    const count = await this.noteModel.countDocuments({
      userId: new Types.ObjectId(userId),
      museumId: new Types.ObjectId(museumId),
    });
    return count > 0;
  }

  // 获取博物馆的笔记数量
  async countByMuseum(museumId: string): Promise<number> {
    return this.noteModel.countDocuments({
      museumId: new Types.ObjectId(museumId),
      visibility: 'public',
    });
  }
}