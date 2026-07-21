export interface IAIService {
  classifyPersonality(
    answers: { questionText: string; answerText: string }[],
    hobbies: string[],
    archetypes: { id: number; name: string; description: string }[],
  ): Promise<number>;
}
