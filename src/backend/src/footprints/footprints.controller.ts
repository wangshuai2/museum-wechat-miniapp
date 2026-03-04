import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { FootprintsService } from './footprints.service';
import { CreateFootprintDto } from './dto/create-footprint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
  };
}

@Controller('footprints')
export class FootprintsController {
  constructor(private readonly footprintsService: FootprintsService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyFootprints(
    @Request() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);
    return this.footprintsService.findByUserId(req.user.userId, pageNum, limitNum);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Request() req: RequestWithUser) {
    return this.footprintsService.getStatistics(req.user.userId);
  }

  @Get('check/:museumId')
  @UseGuards(JwtAuthGuard)
  async checkIfVisited(@Request() req: RequestWithUser, @Param('museumId') museumId: string) {
    const visited = await this.footprintsService.checkIfVisited(
      req.user.userId,
      museumId,
    );
    return { visited };
  }

  @Get('museum/:museumId')
  async getByMuseum(
    @Param('museumId') museumId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);
    return this.footprintsService.findByMuseumId(museumId, pageNum, limitNum, true);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.footprintsService.findById(id, req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: RequestWithUser, @Body() createFootprintDto: CreateFootprintDto) {
    return this.footprintsService.create(req.user.userId, createFootprintDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    await this.footprintsService.remove(id, req.user.userId);
    return { message: '删除成功' };
  }
}