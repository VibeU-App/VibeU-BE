export class SwipeEntity {
  constructor(
    public readonly id: string,
    public readonly swiperId: string,
    public readonly targetId: string,
    public readonly isLike: boolean,
    public readonly createdAt: Date,
  ) {}
}
