export class CommentEntity {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  author?: {
    userId: string;
    fullName: string;
    avatarSeed: string;
  };
}
