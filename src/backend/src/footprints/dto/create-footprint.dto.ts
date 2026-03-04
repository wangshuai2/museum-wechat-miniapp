import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsDate,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFootprintDto {
  @IsMongoId({ message: '博物馆ID格式不正确' })
  @IsNotEmpty({ message: '博物馆ID不能为空' })
  museumId: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: '参观日期不能为空' })
  visitDate: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @IsNumber()
  @Min(1, { message: '评分最低为1' })
  @Max(5, { message: '评分最高为5' })
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  feelings?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsString()
  @IsOptional()
  weather?: string;

  @IsString()
  @IsOptional()
  companion?: string;
}