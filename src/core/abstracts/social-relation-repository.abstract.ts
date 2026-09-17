export abstract class ISocialRelationRepository {
  abstract getMatchedUserIds(userId: string): Promise<string[]>;
  abstract getSwipedRightUserIds(userId: string): Promise<string[]>;
}
