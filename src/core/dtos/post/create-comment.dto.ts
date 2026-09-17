import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment text content', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  content: string;
}
