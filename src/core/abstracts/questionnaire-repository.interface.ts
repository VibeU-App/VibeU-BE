import {
  QuestionnaireQuestionEntity,
  QuestionnaireOptionEntity,
  UserQuestionnaireAnswerEntity,
} from '../entities/questionnaire.entity';

export interface IQuestionnaireRepository {
  findQuestions(): Promise<QuestionnaireQuestionEntity[]>;
  findOptionsByQuestionIds(questionIds: string[]): Promise<QuestionnaireOptionEntity[]>;
  saveAnswers(answers: UserQuestionnaireAnswerEntity[]): Promise<void>;
  findUserAnswers(profileId: number): Promise<UserQuestionnaireAnswerEntity[]>;
}
