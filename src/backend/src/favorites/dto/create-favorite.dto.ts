import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';

export class CreateFavoriteDto {
  @IsEnum(['museum', 'exhibit', 'exhibition'], {
    message: '收藏目标类型只能是 museum、exhibit 或 exhibition',
  })
  @IsNotEmpty({ message: '收藏目标类型不能为空' })
  targetType: 'museum' | 'exhibit' | 'exhibition';

  @IsString()
  @IsNotEmpty({ message: '收藏目标ID不能为空' })
  targetId: string;

  @IsEnum(['want', 'visited'], { message: '状态只能是 want 或 visited' })
  @IsOptional()
  status?: 'want' | 'visited';

  @IsString()
  @MaxLength(200, { message: '备注最多200个字符' })
  @IsOptional()
  note?: string;
}