import { Injectable, Logger } from '@nestjs/common';
import { IAIService } from '../../core/abstracts/ai-service.interface';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiAiService implements IAIService {
  private readonly logger = new Logger(GeminiAiService.name);
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || 'mock_key',
    );
  }

  async classifyPersonality(
    answers: { questionText: string; answerText: string }[],
    hobbies: string[],
    archetypes: { id: number; name: string; description: string }[],
  ): Promise<number> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        this.logger.warn(
          'No GEMINI_API_KEY provided, falling back to first archetype.',
        );
        return archetypes[0].id;
      }

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const prompt = `
        You are a highly perceptive personality profiler.
        Based on the user's questionnaire answers and hobbies, determine which personality archetype fits them best.
        
        Hobbies:
        ${hobbies.join(', ')}

        Answers:
        ${answers.map((a) => `Q: ${a.questionText}\nA: ${a.answerText}`).join('\n\n')}

        Archetypes:
        ${archetypes.map((a) => `ID: ${a.id} - Name: ${a.name} - Desc: ${a.description}`).join('\n')}

        Return ONLY the integer ID of the best matching archetype. Nothing else.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const parsedId = parseInt(text, 10);
      if (!isNaN(parsedId) && archetypes.some((a) => a.id === parsedId)) {
        return parsedId;
      }

      // Fallback if AI returns something weird
      this.logger.warn(
        `AI returned invalid ID: ${text}, falling back to first archetype`,
      );
      return archetypes[0].id;
    } catch (error) {
      this.logger.error(
        'Error calling Gemini API for personality classification',
        error,
      );
      // Fallback
      return archetypes[0].id;
    }
  }
}
