import { IsString, IsArray, IsOptional, MaxLength, ArrayMaxSize, IsUrl, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiPropertyOptional({ description: 'Post text content', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ValidateIf(o => !o.mediaUrls || o.mediaUrls.length === 0)
  content?: string;

  @ApiPropertyOptional({ description: 'Media URLs', type: [String], maxItems: 5 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  @ValidateIf(o => !o.content || o.content.trim().length === 0)
  mediaUrls?: string[];
}
