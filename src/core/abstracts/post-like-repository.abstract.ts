export abstract class IPostLikeRepository {
  abstract toggleLike(
    postId: string,
    userId: string,
  ): Promise<{ hasLiked: boolean; likeDelta: number }>;

  abstract hasUserLiked(postId: string, userId: string): Promise<boolean>;

  abstract getUserLikedPostIds(
    postIds: string[],
    userId: string,
  ): Promise<Set<string>>;
}
