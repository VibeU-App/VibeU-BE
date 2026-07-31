import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SaveBasicProfileUseCase } from '../use-cases/profile/save-basic-profile.usecase';
import { SaveHobbiesUseCase } from '../use-cases/profile/save-hobbies.usecase';
import { SubmitQuestionnaireUseCase } from '../use-cases/profile/submit-questionnaire.usecase';
import { GetProfileUseCase } from '../use-cases/profile/get-profile.usecase';
import { SaveBasicProfileDto } from '../core/dtos/profile/save-basic-profile.dto';
import { SaveHobbiesDto } from '../core/dtos/profile/save-hobbies.dto';
import { SubmitAnswersDto } from '../core/dtos/profile/submit-answers.dto';
import { ProfileResponseDto } from '../core/dtos/profile/profile-response.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { Envelope } from '../core/envelope/envelope.interface';
import { IHobbyRepository } from '../core/abstracts/hobby-repository.interface';
import { IQuestionnaireRepository } from '../core/abstracts/questionnaire-repository.interface';
import { Inject, Get } from '@nestjs/common';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(
    private readonly saveBasicProfileUseCase: SaveBasicProfileUseCase,
    private readonly saveHobbiesUseCase: SaveHobbiesUseCase,
    private readonly submitQuestionnaireUseCase: SubmitQuestionnaireUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    @Inject('IHobbyRepository')
    private readonly hobbyRepository: IHobbyRepository,
    @Inject('IQuestionnaireRepository')
    private readonly questionnaireRepository: IQuestionnaireRepository,
  ) {}

  @Post('basic')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit Basic Details' })
  @ApiResponse({
    status: 201,
    description: 'Profile created/updated successfully',
  })
  async saveBasicProfile(
    @Req() req: any,
    @Body() dto: SaveBasicProfileDto,
  ): Promise<Envelope<any>> {
    const userId = req.user.sub;

    const profile = await this.saveBasicProfileUseCase.execute(userId, {
      fullName: dto.nickname,
      gender: dto.gender,
      avatarSeed: dto.avatarSeed,
      birthday: new Date(dto.birthday),
      university: dto.university,
    });

    // Helper logic for age and zodiac will be implemented in get-profile or we can compute it here.
    // The contract expects age and zodiac returned. For now we will return them as part of the profile object.
    const now = new Date();
    let age = now.getFullYear() - profile.birthday.getFullYear();
    const m = now.getMonth() - profile.birthday.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < profile.birthday.getDate())) {
      age--;
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success',
      data: {
        profile: {
          id: profile.id,
          userId: profile.userId,
          nickname: profile.fullName,
          gender: profile.gender,
          avatarSeed: profile.avatarSeed,
          birthday: profile.birthday.toISOString(),
          age: age,
          zodiac: 'Gemini', // placeholder
          isCompleted: profile.isCompleted,
        },
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('hobbies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Hobby Tags Dictionary' })
  @ApiResponse({ status: 200, description: 'List of all available hobby tags' })
  async getHobbies(): Promise<Envelope<any>> {
    const hobbies = await this.hobbyRepository.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: {
        tags: hobbies.map((h) => ({
          id: h.id.toString(),
          name: h.name,
          category: h.category,
        })),
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Post('hobbies')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save Selected Hobby Tags' })
  @ApiResponse({ status: 201, description: 'Saved hobbies successfully' })
  async saveHobbies(
    @Req() req: any,
    @Body() dto: SaveHobbiesDto,
  ): Promise<Envelope<any>> {
    const userId = req.user.sub;
    await this.saveHobbiesUseCase.execute(userId, dto.tagIds);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success',
      data: {
        savedCount: dto.tagIds.length,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('questionnaire')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Questionnaire Questions & Options' })
  @ApiResponse({ status: 200, description: 'List of questions and options' })
  async getQuestionnaire(): Promise<Envelope<any>> {
    const questions = await this.questionnaireRepository.findQuestions();
    const options = await this.questionnaireRepository.findOptionsByQuestionIds(
      questions.map((q) => q.id),
    );

    const formattedQuestions = questions.map((q) => ({
      id: q.id.toString(),
      text: q.text,
      order: q.order,
      options: options
        .filter((o) => o.questionId === q.id)
        .map((o) => ({
          id: o.id.toString(),
          text: o.text,
        })),
    }));

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: {
        questions: formattedQuestions,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Post('questionnaire')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit Questionnaire Answers' })
  @ApiResponse({
    status: 201,
    description: 'Answers submitted and personality classified',
  })
  async submitQuestionnaire(
    @Req() req: any,
    @Body() dto: SubmitAnswersDto,
  ): Promise<Envelope<any>> {
    const userId = req.user.sub;

    const result = await this.submitQuestionnaireUseCase.execute(
      userId,
      dto.answers,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Success',
      data: {
        personalityArchetype: {
          id: result.archetype.id.toString(),
          name: result.archetype.name,
          description: result.archetype.description,
        },
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get profile by User ID' })
  @ApiResponse({ status: 200, description: 'Profile details' })
  async getProfile(
    @Param('userId') userId: string,
  ): Promise<Envelope<ProfileResponseDto>> {
    const result = await this.getProfileUseCase.execute(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Success',
      data: this.mapToProfileResponse(result),
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  private mapToProfileResponse(result: any): ProfileResponseDto {
    return {
      id: result.profile.id.toString(),
      userId: result.profile.userId,
      nickname: result.profile.fullName,
      gender: result.profile.gender,
      avatarSeed: result.profile.avatarSeed,
      birthday: result.profile.birthday.toISOString(),
      age: result.age,
      zodiac: result.zodiac,
      university: result.profile.university,
      bio: result.profile.bio,
      isCompleted: result.profile.isCompleted,
      hobbies: result.hobbies.map((h: any) => ({
        id: h.id.toString(),
        name: h.name,
        category: h.category,
      })),
      personalityArchetype: result.archetype
        ? {
            id: result.archetype.id.toString(),
            name: result.archetype.name,
            description: result.archetype.description,
          }
        : undefined,
      stats: {
        outpostCount: result.stats.outpostCount,
        matchlistCount: result.stats.matchlistCount,
      },
    };
  }
}
