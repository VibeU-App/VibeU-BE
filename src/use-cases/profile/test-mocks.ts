import { IProfileRepository } from '../../core/abstracts/profile-repository.interface';
import { IHobbyRepository } from '../../core/abstracts/hobby-repository.interface';
import { IPersonalityArchetypeRepository } from '../../core/abstracts/personality-archetype-repository.interface';
import { IQuestionnaireRepository } from '../../core/abstracts/questionnaire-repository.interface';
import { IAIService } from '../../core/abstracts/ai-service.interface';
import { ProfileEntity } from '../../core/entities/profile.entity';
import { HobbyEntity } from '../../core/entities/hobby.entity';
import { PersonalityArchetypeEntity } from '../../core/entities/personality-archetype.entity';
import {
  QuestionnaireQuestionEntity,
  QuestionnaireOptionEntity,
  UserQuestionnaireAnswerEntity,
} from '../../core/entities/questionnaire.entity';

export class MockProfileRepository implements IProfileRepository {
  private profiles = new Map<string, ProfileEntity>();
  private idCounter = 1;

  async findByUserId(userId: string): Promise<ProfileEntity | null> {
    return this.profiles.get(userId) || null;
  }

  async findById(id: number): Promise<ProfileEntity | null> {
    for (const p of this.profiles.values()) {
      if (p.id === id) return p;
    }
    return null;
  }

  async save(profile: ProfileEntity): Promise<ProfileEntity> {
    const saved = new ProfileEntity(
      this.idCounter++,
      profile.userId,
      profile.fullName,
      profile.gender,
      profile.avatarSeed,
      profile.birthday,
      profile.isCompleted,
      profile.createdAt,
      profile.updatedAt,
      profile.university,
      profile.bio,
      profile.personalityArchetypeId,
    );
    this.profiles.set(profile.userId, saved);
    return saved;
  }

  async update(profile: ProfileEntity): Promise<ProfileEntity> {
    this.profiles.set(profile.userId, profile);
    return profile;
  }

  async getProfilePostAndMatchCounts(
    profileId: number,
  ): Promise<{ outpostCount: number; matchlistCount: number }> {
    return { outpostCount: 5, matchlistCount: 2 };
  }
}

export class MockHobbyRepository implements IHobbyRepository {
  public hobbies: HobbyEntity[] = [];
  public profileHobbies = new Map<number, number[]>();

  async findAll(): Promise<HobbyEntity[]> {
    return this.hobbies;
  }

  async findByIds(ids: number[]): Promise<HobbyEntity[]> {
    return this.hobbies.filter((h) => ids.includes(h.id));
  }

  async findProfileHobbies(profileId: number): Promise<HobbyEntity[]> {
    const ids = this.profileHobbies.get(profileId) || [];
    return this.hobbies.filter((h) => ids.includes(h.id));
  }

  async updateProfileHobbies(
    profileId: number,
    hobbyIds: number[],
  ): Promise<void> {
    this.profileHobbies.set(profileId, hobbyIds);
  }
}

export class MockPersonalityArchetypeRepository implements IPersonalityArchetypeRepository {
  public archetypes: PersonalityArchetypeEntity[] = [];

  async findAll(): Promise<PersonalityArchetypeEntity[]> {
    return this.archetypes;
  }

  async findById(id: number): Promise<PersonalityArchetypeEntity | null> {
    return this.archetypes.find((a) => a.id === id) || null;
  }
}

export class MockQuestionnaireRepository implements IQuestionnaireRepository {
  public questions: QuestionnaireQuestionEntity[] = [];
  public options: QuestionnaireOptionEntity[] = [];
  public answers: UserQuestionnaireAnswerEntity[] = [];

  async findQuestions(): Promise<QuestionnaireQuestionEntity[]> {
    return this.questions;
  }

  async findOptionsByQuestionIds(
    questionIds: number[],
  ): Promise<QuestionnaireOptionEntity[]> {
    return this.options.filter((o) => questionIds.includes(o.questionId));
  }

  async saveAnswers(answers: UserQuestionnaireAnswerEntity[]): Promise<void> {
    this.answers.push(...answers);
  }

  async findUserAnswers(
    profileId: number,
  ): Promise<UserQuestionnaireAnswerEntity[]> {
    return this.answers.filter((a) => a.profileId === profileId);
  }
}

export class MockAIService implements IAIService {
  public mockArchetypeId = 1;

  async classifyPersonality(
    answers: { questionText: string; answerText: string }[],
    hobbies: string[],
    archetypes: { id: number; name: string; description: string }[],
  ): Promise<number> {
    return this.mockArchetypeId;
  }
}
