import { SubmitQuestionnaireUseCase } from './submit-questionnaire.usecase';
import {
  MockProfileRepository,
  MockQuestionnaireRepository,
  MockPersonalityArchetypeRepository,
  MockAIService,
} from './test-mocks';
import { ProfileEntity } from '../../core/entities/profile.entity';
import {
  QuestionnaireQuestionEntity,
  QuestionnaireOptionEntity,
} from '../../core/entities/questionnaire.entity';
import { PersonalityArchetypeEntity } from '../../core/entities/personality-archetype.entity';

describe('SubmitQuestionnaireUseCase', () => {
  let useCase: SubmitQuestionnaireUseCase;
  let mockProfileRepo: MockProfileRepository;
  let mockQuestionnaireRepo: MockQuestionnaireRepository;
  let mockArchetypeRepo: MockPersonalityArchetypeRepository;
  let mockAIService: MockAIService;

  beforeEach(() => {
    mockProfileRepo = new MockProfileRepository();
    mockQuestionnaireRepo = new MockQuestionnaireRepository();
    mockArchetypeRepo = new MockPersonalityArchetypeRepository();
    mockAIService = new MockAIService();

    useCase = new SubmitQuestionnaireUseCase(
      mockProfileRepo,
      mockQuestionnaireRepo,
      mockArchetypeRepo,
      mockAIService,
    );

    // Seed questions
    mockQuestionnaireRepo.questions = [
      new QuestionnaireQuestionEntity('q-1', 'Question 1', 1, new Date(), new Date()),
      new QuestionnaireQuestionEntity('q-2', 'Question 2', 2, new Date(), new Date()),
    ];

    // Seed options
    mockQuestionnaireRepo.options = [
      new QuestionnaireOptionEntity('opt-1-a', 'q-1', 'Option A', new Date(), new Date()),
      new QuestionnaireOptionEntity('opt-1-b', 'q-1', 'Option B', new Date(), new Date()),
      new QuestionnaireOptionEntity('opt-2-a', 'q-2', 'Option A', new Date(), new Date()),
      new QuestionnaireOptionEntity('opt-2-b', 'q-2', 'Option B', new Date(), new Date()),
    ];

    // Seed archetypes
    mockArchetypeRepo.archetypes = [
      new PersonalityArchetypeEntity('lotus-id', 'Lotus', 'Lotus Desc', ['Empathetic'], new Date(), new Date()),
    ];
  });

  it('should successfully submit answers and classify user with an AI archetype', async () => {
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'seed',
      new Date('2000-01-01'),
      false,
      new Date(),
      new Date(),
    );
    await mockProfileRepo.save(profile);

    const answers = [
      { questionId: 'q-1', selectedOptionId: 'opt-1-a' },
      { questionId: 'q-2', selectedOptionId: 'opt-2-b' },
    ];

    const result = await useCase.execute('user-1', answers);

    expect(result).toBe('lotus-id');

    const updatedProfile = await mockProfileRepo.findByUserId('user-1');
    expect(updatedProfile?.personalityArchetypeId).toBe('lotus-id');
    expect(updatedProfile?.isCompleted).toBe(true);

    const savedAnswers = await mockQuestionnaireRepo.findUserAnswers(1);
    expect(savedAnswers.length).toBe(2);
  });

  it('should throw an error if profile is not found', async () => {
    const answers = [
      { questionId: 'q-1', selectedOptionId: 'opt-1-a' },
      { questionId: 'q-2', selectedOptionId: 'opt-2-b' },
    ];
    await expect(useCase.execute('non-existent', answers)).rejects.toThrow(
      'Profile not found',
    );
  });

  it('should throw an error if not all questions are answered', async () => {
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'seed',
      new Date('2000-01-01'),
      false,
      new Date(),
      new Date(),
    );
    await mockProfileRepo.save(profile);

    const incompleteAnswers = [
      { questionId: 'q-1', selectedOptionId: 'opt-1-a' },
    ];

    await expect(useCase.execute('user-1', incompleteAnswers)).rejects.toThrow(
      'Must answer all questions',
    );
  });

  it('should throw an error if selected option does not belong to the question', async () => {
    const profile = new ProfileEntity(
      1,
      'user-1',
      'Alice',
      'Female',
      'seed',
      new Date('2000-01-01'),
      false,
      new Date(),
      new Date(),
    );
    await mockProfileRepo.save(profile);

    const invalidAnswers = [
      { questionId: 'q-1', selectedOptionId: 'opt-2-a' }, // opt-2-a belongs to q-2
      { questionId: 'q-2', selectedOptionId: 'opt-2-b' },
    ];

    await expect(useCase.execute('user-1', invalidAnswers)).rejects.toThrow(
      'Invalid question or option selection',
    );
  });
});
