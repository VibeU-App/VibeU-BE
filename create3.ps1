New-Item -ItemType Directory -Force -Path "src/controllers/dto/post" | Out-Null
New-Item -ItemType Directory -Force -Path "src/use-cases/post" | Out-Null

$content = @'
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
'@
Set-Content -Path "src/controllers/dto/post/create-post.dto.ts" -Value $content -Encoding UTF8

$content = @'
import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PinPostDto {
  @ApiProperty({ description: 'Pin status' })
  @IsBoolean()
  isPinned: boolean;
}
'@
Set-Content -Path "src/controllers/dto/post/pin-post.dto.ts" -Value $content -Encoding UTF8

$content = @'
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TimelineFeedQueryDto {
  @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;
}
'@
Set-Content -Path "src/controllers/dto/post/timeline-feed-query.dto.ts" -Value $content -Encoding UTF8

$content = @'
import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment text content', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  content: string;
}
'@
Set-Content -Path "src/controllers/dto/post/create-comment.dto.ts" -Value $content -Encoding UTF8

$content = @'
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileFeedQueryDto {
  @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;
}
'@
Set-Content -Path "src/controllers/dto/post/profile-feed-query.dto.ts" -Value $content -Encoding UTF8

Write-Host "Created all DTOs"
