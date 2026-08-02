import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsString,
} from 'class-validator';

/**
 * Request DTO for update profile tags.
 * Information on new tags for updating.
 */
export class UpdateProfileTagsRequestDto {
  @ApiProperty({ example: [1, 2, 3] })
  @ArrayMinSize(3)
  @ArrayMaxSize(10)
  @ArrayUnique()
  hobbyIds: number[];
}
