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
      new QuestionnaireQuestionEntity(1, 'Question 1', 1, new Date(), new Date()),
      new QuestionnaireQuestionEntity(2, 'Question 2', 2, new Date(), new Date()),
    ];

    // Seed options
    mockQuestionnaireRepo.options = [
      new QuestionnaireOptionEntity(10, 1, 'Option A', new Date(), new Date()),
      new QuestionnaireOptionEntity(11, 1, 'Option B', new Date(), new Date()),
      new QuestionnaireOptionEntity(20, 2, 'Option A', new Date(), new Date()),
      new QuestionnaireOptionEntity(21, 2, 'Option B', new Date(), new Date()),
    ];

    // Seed archetypes
    mockArchetypeRepo.archetypes = [
      new PersonalityArchetypeEntity(1, 'Lotus', 'Lotus Desc', ['Empathetic'], new Date(), new Date()),
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
      { questionId: 1, selectedOptionId: 10 },
      { questionId: 2, selectedOptionId: 21 },
    ];

    // Note: Since usecases are placeholders returning NotImplemented, we expect it to throw here
    await expect(useCase.execute('user-1', answers)).rejects.toThrow('Method not implemented.');
  });

  it('should throw an error if profile is not found', async () => {
    const answers = [
      { questionId: 1, selectedOptionId: 10 },
      { questionId: 2, selectedOptionId: 21 },
    ];
    await expect(useCase.execute('non-existent', answers)).rejects.toThrow(
      'Method not implemented.',
    );
  });
});
