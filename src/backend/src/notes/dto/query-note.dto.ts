import {
  IsOptional,
  IsString,
  IsMongoId,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryNoteDto {
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

  @IsMongoId({ message: '博物馆ID格式不正确' })
  @IsOptional()
  museumId?: string;

  @IsMongoId({ message: '展品ID格式不正确' })
  @IsOptional()
  exhibitId?: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  keyword?: string;

  @IsString()
  @IsOptional()
  visibility?: 'private' | 'public';

  @IsString()
  @IsOptional()
  orderBy?: 'latest' | 'popular';
}