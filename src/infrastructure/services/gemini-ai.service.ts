import { Injectable, Logger } from '@nestjs/common';
import { IAIService } from '../../core/abstracts/ai-service.interface';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

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

  async generatePersonalityResult(
    dominantArchetype: string,
    scoreSummary: Record<string, number>,
    percentageSummary: Record<string, number>,
    answers: { questionText: string; answerText: string }[],
  ): Promise<{
    personality_code: string;
    personality_name: string;
    vibe_description: string;
    matching_criteria: string;
  }> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        this.logger.warn(
          'No GEMINI_API_KEY provided, returning mock personality result.',
        );
        return {
          personality_code: dominantArchetype,
          personality_name: 'Unknown',
          vibe_description: 'Mock vibe description (No API key).',
          matching_criteria: 'Mock matching criteria (No API key).',
        };
      }

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const promptTemplatePath = path.join(
        __dirname,
        'generate-personality-prompt.txt',
      );
      const promptTemplate = fs.readFileSync(promptTemplatePath, 'utf8');

      const userDataStr = JSON.stringify(
        {
          dominant_archetype: dominantArchetype,
          score_summary: scoreSummary,
          percentage_summary: percentageSummary,
          answers: answers.map((a) => ({
            question: a.questionText,
            answer: a.answerText,
          })),
        },
        null,
        2,
      );

      const prompt = promptTemplate.replace('{{USER_INPUT_DATA}}', userDataStr);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      // Clean up potential markdown formatting wrapping the JSON
      if (text.startsWith('\`\`\`json')) {
        text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
      } else if (text.startsWith('\`\`\`')) {
        text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
      }

      return JSON.parse(text);
    } catch (error) {
      this.logger.error(
        'Error calling Gemini API for personality result generation',
        error,
      );
      // Fallback
      return {
        personality_code: dominantArchetype,
        personality_name: 'Unknown',
        vibe_description: 'Có lỗi xảy ra trong quá trình tạo kết quả.',
        matching_criteria: 'Vui lòng thử lại sau.',
      };
    }
  }
}
