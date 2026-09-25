export class MatchEntity {
  constructor(
    public readonly id: string,
    public readonly user1Id: string,
    public readonly user2Id: string,
    public readonly createdAt: Date,
  ) {}

  // Joined/Populated user profile for presentation
  matchedUser?: {
    userId: string;
    nickname: string;
    avatarSeed: string;
    university: string | null;
    archetypeName: string | null;
  };
}
