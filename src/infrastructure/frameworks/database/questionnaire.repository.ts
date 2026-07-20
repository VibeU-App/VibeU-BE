import { Injectable } from '@nestjs/common';
import { IQuestionnaireRepository } from '../../../core/abstracts/questionnaire-repository.interface';
import {
  QuestionnaireQuestionEntity,
  QuestionnaireOptionEntity,
  UserQuestionnaireAnswerEntity,
} from '../../../core/entities/questionnaire.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaQuestionnaireRepository implements IQuestionnaireRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findQuestions(): Promise<QuestionnaireQuestionEntity[]> {
    const list = await this.prisma.questionnaireQuestion.findMany({
      orderBy: { order: 'asc' },
    });
    return list.map(
      (q) => new QuestionnaireQuestionEntity(q.id, q.text, q.order, q.createdAt, q.updatedAt),
    );
  }

  async findOptionsByQuestionIds(questionIds: string[]): Promise<QuestionnaireOptionEntity[]> {
    const list = await this.prisma.questionnaireOption.findMany({
      where: { questionId: { in: questionIds } },
    });
    return list.map(
      (o) => new QuestionnaireOptionEntity(o.id, o.questionId, o.text, o.createdAt, o.updatedAt),
    );
  }

  async saveAnswers(answers: UserQuestionnaireAnswerEntity[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Upsert each answer using transactions
      for (const ans of answers) {
        await tx.userQuestionnaireAnswer.upsert({
          where: {
            profileId_questionId: {
              profileId: ans.profileId,
              questionId: ans.questionId,
            },
          },
          update: {
            selectedOptionId: ans.selectedOptionId,
          },
          create: {
            profileId: ans.profileId,
            questionId: ans.questionId,
            selectedOptionId: ans.selectedOptionId,
          },
        });
      }
    });
  }

  async findUserAnswers(profileId: number): Promise<UserQuestionnaireAnswerEntity[]> {
    const list = await this.prisma.userQuestionnaireAnswer.findMany({
      where: { profileId },
    });
    return list.map(
      (a) => new UserQuestionnaireAnswerEntity(a.id, a.profileId, a.questionId, a.selectedOptionId, a.createdAt),
    );
  }
}
