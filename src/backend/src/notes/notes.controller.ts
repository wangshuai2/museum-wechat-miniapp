import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNoteDto } from './dto/query-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
  };
}

// 统一响应格式
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

function successResponse<T>(data: T, message: string = 'success'): ApiResponse<T> {
  return {
    code: 200,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  // 创建笔记
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: RequestWithUser, @Body() createNoteDto: CreateNoteDto) {
    const note = await this.notesService.create(req.user.userId, createNoteDto);
    return successResponse(note, '创建成功');
  }

  // 获取公开笔记列表（发现页）
  @Get('public')
  async getPublicNotes(@Query() query: QueryNoteDto) {
    const result = await this.notesService.findAll(query);
    return successResponse(result);
  }

  // 获取我的笔记
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyNotes(@Request() req: RequestWithUser, @Query() query: QueryNoteDto) {
    const result = await this.notesService.findMy(req.user.userId, query);
    return successResponse(result);
  }

  // 获取笔记统计
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Request() req: RequestWithUser) {
    const stats = await this.notesService.getStatistics(req.user.userId);
    return successResponse(stats);
  }

  // 检查用户在某博物馆是否有笔记
  @Get('check/:museumId')
  @UseGuards(JwtAuthGuard)
  async checkUserHasNote(
    @Request() req: RequestWithUser,
    @Param('museumId') museumId: string,
  ) {
    const hasNote = await this.notesService.checkUserHasNoteInMuseum(
      req.user.userId,
      museumId,
    );
    return successResponse({ hasNote });
  }

  // 获取笔记详情
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Request() req: RequestWithUser, @Param('id') id: string) {
    const note = await this.notesService.findById(id, req.user.userId);
    return successResponse(note);
  }

  // 更新笔记
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    const note = await this.notesService.update(id, req.user.userId, updateNoteDto);
    return successResponse(note, '更新成功');
  }

  // 删除笔记
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    await this.notesService.remove(id, req.user.userId);
    return successResponse(null, '删除成功');
  }
}