import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';
import { IQuestionnaireRepository } from '../../core/abstracts/questionnaire-repository.interface';
import { IPersonalityArchetypeRepository } from '../../core/abstracts/personality-archetype-repository.interface';
import { IAIService } from '../../core/abstracts/ai-service.interface';
import { IHobbyRepository } from '../../core/abstracts/hobby-repository.interface';
import { ProfileEntity } from '../../core/entities/profile.entity';
import { UserQuestionnaireAnswerEntity } from '../../core/entities/questionnaire.entity';

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
  ): Promise<{ profile: ProfileEntity; archetype: any }> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new Error('Profile not found');

    const questions = await this.questionnaireRepository.findQuestions();
    const options = await this.questionnaireRepository.findOptionsByQuestionIds(
      questions.map((q) => q.id),
    );

    const formattedAnswers: { questionText: string; answerText: string }[] = [];

    // validate answers
    for (const answer of answers) {
      const q = questions.find((q) => q.id === answer.questionId);
      if (!q) throw new Error(`Invalid question ID: ${answer.questionId}`);
      const o = options.find(
        (o) =>
          o.id === answer.selectedOptionId &&
          o.questionId === answer.questionId,
      );
      if (!o)
        throw new Error(
          `Invalid option ID: ${answer.selectedOptionId} for question: ${answer.questionId}`,
        );

      formattedAnswers.push({
        questionText: q.text,
        answerText: o.text,
      });
    }

    const answerEntities = answers.map(
      (a) =>
        new UserQuestionnaireAnswerEntity(
          '0',
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

    const updatedProfile = await this.profileRepository.update({
      ...profile,
      personalityArchetypeId: matchedArchetypeId,
      isCompleted: true,
    });

    return {
      profile: updatedProfile,
      archetype: archetypes.find((a) => a.id === matchedArchetypeId)!,
    };
  }
}
