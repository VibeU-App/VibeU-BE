export class ProfileEntity {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly fullName: string,
    public readonly gender: string,
    public readonly avatarSeed: string,
    public readonly birthday: Date,
    public readonly isCompleted: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly university: string | null = null,
    public readonly bio: string | null = null,
    public readonly personalityArchetypeId: number | null = null,
  ) {}

  static create(props: {
    userId: string;
    fullName: string;
    gender: string;
    avatarSeed: string;
    birthday: Date;
    university?: string | null;
    bio?: string | null;
    personalityArchetypeId?: number | null;
  }): ProfileEntity {
    const now = new Date();
    return new ProfileEntity(
      0, // ID will be assigned by DB auto-increment
      props.userId,
      props.fullName,
      props.gender,
      props.avatarSeed,
      props.birthday,
      false,
      now,
      now,
      props.university ?? null,
      props.bio ?? null,
      props.personalityArchetypeId ?? null,
    );
  }
}
