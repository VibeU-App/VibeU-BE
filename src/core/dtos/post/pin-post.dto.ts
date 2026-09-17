import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PinPostDto {
  @ApiProperty({ description: 'Pin status' })
  @IsBoolean()
  isPinned: boolean;
}
