export type AuthorRelation = 'MATCHED' | 'SWIPED' | 'STRANGER';

export class PostEntity {
  id: string;
  authorId: string;
  content: string | null;
  mediaUrls: string[];
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  hasLiked?: boolean;
  relation?: AuthorRelation;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  author?: {
    userId: string;
    fullName: string;
    avatarSeed: string;
  };
}
