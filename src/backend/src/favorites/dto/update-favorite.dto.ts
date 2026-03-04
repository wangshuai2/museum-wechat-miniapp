import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';

export class UpdateFavoriteDto {
  @IsEnum(['want', 'visited'], { message: '状态只能是 want 或 visited' })
  @IsOptional()
  status?: 'want' | 'visited';

  @IsString()
  @MaxLength(200, { message: '备注最多200个字符' })
  @IsOptional()
  note?: string;
}