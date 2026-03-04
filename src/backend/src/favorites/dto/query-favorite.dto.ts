import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryFavoriteDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsEnum(['museum', 'exhibit', 'exhibition'], {
    message: '收藏目标类型只能是 museum、exhibit 或 exhibition',
  })
  @IsOptional()
  targetType?: 'museum' | 'exhibit' | 'exhibition';

  @IsEnum(['want', 'visited'], { message: '状态只能是 want 或 visited' })
  @IsOptional()
  status?: 'want' | 'visited';

  @IsString()
  @IsOptional()
  museumId?: string;
}