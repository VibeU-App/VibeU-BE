export class CandidateCardEntity {
  constructor(
    public readonly userId: string,
    public readonly nickname: string,
    public readonly gender: string, // Strictly opposite of viewer's gender
    public readonly birthday: Date,
    public readonly age: number,
    public readonly university: string | null,
    public readonly bio: string | null,
    public readonly avatarSeed: string,
    public readonly photos: string[],
    public readonly hobbies: string[],
    public readonly personalityArchetype: {
      id: number;
      name: string;
      imageUrl: string | null;
    } | null,
  ) {}
}
