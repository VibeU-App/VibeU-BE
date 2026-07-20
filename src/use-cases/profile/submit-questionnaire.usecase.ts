import { Inject, Injectable } from '@nestjs/common';
import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';
import { IQuestionnaireRepository } from '../../core/abstracts/questionnaire-repository.interface';
import { IPersonalityArchetypeRepository } from '../../core/abstracts/personality-archetype-repository.interface';
import { IAIService } from '../../core/abstracts/ai-service.interface';

@Injectable()
export class SubmitQuestionnaireUseCase {
  constructor(
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    @Inject('IQuestionnaireRepository')
    private readonly questionnaireRepository: IQuestionnaireRepository,
    @Inject('IPersonalityArchetypeRepository')
    private readonly archetypeRepository: IPersonalityArchetypeRepository,
    @Inject('IAIService')
    private readonly aiService: IAIService,
  ) {}

  async execute(
    userId: string,
    answers: { questionId: string; selectedOptionId: string }[],
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
