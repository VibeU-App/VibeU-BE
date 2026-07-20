export class HobbyEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly category: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: { name: string; category: string }): HobbyEntity {
    const now = new Date();
    return new HobbyEntity(0, props.name, props.category, now, now);
  }
}
