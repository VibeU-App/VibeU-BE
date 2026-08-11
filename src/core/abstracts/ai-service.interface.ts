export interface IAIService {
  classifyPersonality(
    answers: { questionText: string; answerText: string }[],
    hobbies: string[],
    archetypes: { id: number; name: string; description: string }[],
  ): Promise<number>;

  generatePersonalityResult(
    dominantArchetype: string,
    scoreSummary: Record<string, number>,
    percentageSummary: Record<string, number>,
    answers: { questionText: string; answerText: string }[],
  ): Promise<{
    personality_code: string;
    personality_name: string;
    vibe_description: string;
    matching_criteria: string;
  }>;
}
