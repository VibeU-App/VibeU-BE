import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNumber,
} from 'class-validator';

/**
 * Request DTO for update profile tags.
 * Information on new tags for updating.
 */
export class UpdateProfileTagsRequestDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(10)
  @ArrayUnique()
  @Transform(({ value }) => {
    if (!Array.isArray(value)) return value;

    return value.map((e) => {
      if (e === '' || e === null || typeof e === 'boolean') return NaN;
      return Number(e);
    });
  })
  @IsNumber({}, { each: true })
  hobbyIds: number[];
}
