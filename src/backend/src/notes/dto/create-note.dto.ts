import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsArray,
  IsEnum,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class CreateNoteDto {
  @IsMongoId({ message: '博物馆ID格式不正确' })
  @IsNotEmpty({ message: '博物馆ID不能为空' })
  museumId: string;

  @IsMongoId({ message: '展品ID格式不正确' })
  @IsOptional()
  exhibitId?: string;

  @IsMongoId({ message: '足迹ID格式不正确' })
  @IsOptional()
  footprintId?: string;

  @IsString()
  @MaxLength(100, { message: '标题最多100个字符' })
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty({ message: '笔记内容不能为空' })
  @MaxLength(5000, { message: '笔记内容最多5000个字符' })
  content: string;

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