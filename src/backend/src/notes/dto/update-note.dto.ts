import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @MaxLength(100, { message: '标题最多100个字符' })
  @IsOptional()
  title?: string;

  @IsString()
  @MaxLength(5000, { message: '笔记内容最多5000个字符' })
  @IsOptional()
  content?: string;

  @IsArray()
  @IsString({ each: true, message: '图片URL必须是字符串' })
  @ArrayMaxSize(9, { message: '最多上传9张图片' })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true, message: '标签必须是字符串' })
  @IsOptional()
  tags?: string[];

  @IsEnum(['private', 'public'], { message: '可见性只能是 private 或 public' })
  @IsOptional()
  visibility?: 'private' | 'public';
}