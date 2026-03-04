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
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { QueryFavoriteDto } from './dto/query-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
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

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // 添加收藏
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: RequestWithUser, @Body() createFavoriteDto: CreateFavoriteDto) {
    const favorite = await this.favoritesService.create(
      req.user.userId,
      createFavoriteDto,
    );
    return successResponse(favorite, '收藏成功');
  }

  // 获取我的收藏
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyFavorites(
    @Request() req: RequestWithUser,
    @Query() query: QueryFavoriteDto,
  ) {
    const result = await this.favoritesService.findMy(req.user.userId, query);
    return successResponse(result);
  }

  // 检查收藏状态
  @Get('check')
  @UseGuards(JwtAuthGuard)
  async checkFavorite(
    @Request() req: RequestWithUser,
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    const result = await this.favoritesService.checkFavorite(
      req.user.userId,
      targetType,
      targetId,
    );
    return successResponse(result);
  }

  // 获取收藏统计
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Request() req: RequestWithUser) {
    const stats = await this.favoritesService.getStatistics(req.user.userId);
    return successResponse(stats);
  }

  // 更新收藏状态
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    const favorite = await this.favoritesService.update(
      id,
      req.user.userId,
      updateFavoriteDto,
    );
    return successResponse(favorite, '更新成功');
  }

  // 更新收藏状态（兼容技术方案中的 PUT /favorites/:id/status）
  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    const favorite = await this.favoritesService.update(
      id,
      req.user.userId,
      updateFavoriteDto,
    );
    return successResponse(favorite, '更新成功');
  }

  // 取消收藏
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    await this.favoritesService.remove(id, req.user.userId);
    return successResponse(null, '取消收藏成功');
  }

  // 批量操作
  @Post('batch')
  @UseGuards(JwtAuthGuard)
  async batchOperation(
    @Request() req: RequestWithUser,
    @Body() body: { action: 'delete' | 'updateStatus'; ids: string[]; status?: 'want' | 'visited' },
  ) {
    const { action, ids, status } = body;

    if (action === 'delete') {
      const count = await this.favoritesService.batchDelete(ids, req.user.userId);
      return successResponse({ deletedCount: count }, '批量删除成功');
    } else if (action === 'updateStatus') {
      if (!status) {
        return successResponse({ error: 'status is required for updateStatus action' }, '参数错误');
      }
      const count = await this.favoritesService.batchUpdateStatus(
        ids,
        req.user.userId,
        status,
      );
      return successResponse({ updatedCount: count }, '批量更新成功');
    }

    return successResponse(null, '未知操作');
  }

  // 更新排序
  @Put('sort')
  @UseGuards(JwtAuthGuard)
  async updateSortOrder(
    @Request() req: RequestWithUser,
    @Body() body: { orders: { id: string; sortOrder: number }[] },
  ) {
    await this.favoritesService.updateSortOrder(req.user.userId, body.orders);
    return successResponse(null, '排序更新成功');
  }
}