import { IsArray, ArrayMinSize, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AnswerDto {
  @ApiProperty({ example: 1, description: 'ID of the question' })
  @IsInt()
  questionId!: number;

  @ApiProperty({ example: 10, description: 'ID of the selected option' })
  @IsInt()
  selectedOptionId!: number;
}

export class SubmitAnswersRequestDto {
  @ApiProperty({ type: [AnswerDto], description: 'Array of user answers' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];
}

class PersonalityArchetypeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;
}

export class SubmitAnswersResponseDto {
  @ApiProperty({ type: PersonalityArchetypeDto })
  personalityArchetype!: PersonalityArchetypeDto;
}
