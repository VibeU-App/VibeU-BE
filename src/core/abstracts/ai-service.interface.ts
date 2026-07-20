export interface IAIService {
  classifyPersonality(
    answers: { questionText: string; answerText: string }[],
    hobbies: string[],
    archetypes: { id: string; name: string; description: string }[],
  ): Promise<string>;
}
