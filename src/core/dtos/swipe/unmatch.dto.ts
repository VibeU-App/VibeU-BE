import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UnmatchResponseDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  result: boolean;
}
