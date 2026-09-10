import { Inject, Injectable } from '@nestjs/common';
import {
  IProfileRepository,
  IQuestionnaireRepository,
  IPersonalityArchetypeRepository,
  IAIService,
  IHobbyRepository,
} from '../../core/abstracts';
import { ProfileEntity } from '../../core/entities/profile.entity';
import { PersonalityArchetypeEntity } from '../../core/entities/personality-archetype.entity';
import { UserQuestionnaireAnswerEntity } from '../../core/entities/questionnaire.entity';
import { AppException, ErrorCode } from '../../core/errors';

export interface SubmitQuestionnaireResult {
  profile: ProfileEntity;
  archetype: PersonalityArchetypeEntity | null;
}

@Injectable()
export class SubmitQuestionnaireUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    @Inject('IQuestionnaireRepository')
    private readonly questionnaireRepository: IQuestionnaireRepository,
    @Inject('IPersonalityArchetypeRepository')
    private readonly archetypeRepository: IPersonalityArchetypeRepository,
    @Inject('IHobbyRepository')
    private readonly hobbyRepository: IHobbyRepository,
    @Inject('IAIService')
    private readonly aiService: IAIService,
  ) {}

  async execute(
    userId: string,
    answers: { questionId: number; selectedOptionId: number }[],
  ): Promise<SubmitQuestionnaireResult> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppException(ErrorCode.PROFILE_USER_NOT_FOUND);
    }

    const questions = await this.questionnaireRepository.findQuestions();
    const options = await this.questionnaireRepository.findOptionsByQuestionIds(
      questions.map((q) => q.id),
    );

    const formattedAnswers: { questionText: string; answerText: string }[] = [];

    // validate answers
    for (const answer of answers) {
      const q = questions.find((item) => item.id === answer.questionId);
      if (!q) {
        throw new AppException(
          ErrorCode.VALIDATION_FAILED,
          400,
          `Invalid question ID: ${answer.questionId}`,
        );
      }
      const o = options.find(
        (item) =>
          item.id === answer.selectedOptionId &&
          item.questionId === answer.questionId,
      );
      if (!o) {
        throw new AppException(
          ErrorCode.VALIDATION_FAILED,
          400,
          `Invalid option ID: ${answer.selectedOptionId} for question: ${answer.questionId}`,
        );
      }

      formattedAnswers.push({
        questionText: q.text,
        answerText: o.text,
      });
    }

    const answerEntities = answers.map(
      (a) =>
        new UserQuestionnaireAnswerEntity(
          '',
          profile.id,
          a.questionId,
          a.selectedOptionId,
          new Date(),
        ),
    );

    await this.questionnaireRepository.saveAnswers(answerEntities);

    const hobbies = await this.hobbyRepository.findProfileHobbies(profile.id);
    const hobbyNames = hobbies.map((h) => h.name);

    const archetypes = await this.archetypeRepository.findAll();

    const matchedArchetypeId = await this.aiService.classifyPersonality(
      formattedAnswers,
      hobbyNames,
      archetypes,
    );

    const newProfile = new ProfileEntity(
      profile.id,
      profile.userId,
      profile.nickname,
      profile.gender,
      profile.avatarSeed,
      profile.birthday,
      true, // isCompleted
      profile.createdAt,
      new Date(),
      profile.university,
      profile.bio,
      matchedArchetypeId,
    );

    const updatedProfile = await this.profileRepository.update(newProfile);

    return {
      profile: updatedProfile,
      archetype: archetypes.find((a) => a.id === matchedArchetypeId) ?? null,
    };
  }
}
