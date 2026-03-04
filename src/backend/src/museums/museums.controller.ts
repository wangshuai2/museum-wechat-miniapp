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
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { MuseumsService } from './museums.service';
import { CreateMuseumDto } from './dto/create-museum.dto';
import { UpdateMuseumDto } from './dto/update-museum.dto';
import { QueryMuseumDto } from './dto/query-museum.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
  };
}

@Controller('museums')
export class MuseumsController {
  constructor(private readonly museumsService: MuseumsService) {}

  @Get()
  async findAll(@Query() query: QueryMuseumDto) {
    return this.museumsService.findAll(query);
  }

  @Get('featured')
  async getFeatured(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.museumsService.getFeatured(limit);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.museumsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: RequestWithUser, @Body() createMuseumDto: CreateMuseumDto) {
    return this.museumsService.create(createMuseumDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateMuseumDto: UpdateMuseumDto,
  ) {
    return this.museumsService.update(id, updateMuseumDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    await this.museumsService.remove(id);
    return { message: '删除成功' };
  }
}