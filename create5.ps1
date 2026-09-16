$content = @'
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';
import { PostEntity } from '../../core/entities/post.entity';

@Injectable()
export class CreatePostUsecase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(authorId: string, content?: string, mediaUrls?: string[]): Promise<PostEntity> {
    if ((!content || content.trim().length === 0) && (!mediaUrls || mediaUrls.length === 0)) {
      throw new BadRequestException('Post must contain text or at least one image attachment');
    }
    return this.postRepository.create({ authorId, content, mediaUrls });
  }
}
'@
Set-Content -Path "src/use-cases/post/create-post.usecase.ts" -Value $content -Encoding UTF8

$content = @'
import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';
import { PostEntity } from '../../core/entities/post.entity';

@Injectable()
export class PinPostUsecase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(authorId: string, postId: string, isPinned: boolean): Promise<PostEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== authorId) throw new ForbiddenException('Not authorized');

    return this.postRepository.setPinned(authorId, postId, isPinned);
  }
}
'@
Set-Content -Path "src/use-cases/post/pin-post.usecase.ts" -Value $content -Encoding UTF8

$content = @'
import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';

@Injectable()
export class DeletePostUsecase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(authorId: string, postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== authorId) throw new ForbiddenException('Not authorized');

    await this.postRepository.softDelete(postId);
  }
}
'@
Set-Content -Path "src/use-cases/post/delete-post.usecase.ts" -Value $content -Encoding UTF8

$content = @'
import { Injectable, Inject } from '@nestjs/common';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';
import { ISocialRelationRepository } from '../../core/abstracts/social-relation-repository.abstract';
import { FeedResult } from '../../core/types/feed.types';
import { PostEntity } from '../../core/entities/post.entity';
import { KeysetCursorUtil } from '../../core/utils/keyset-cursor.util';

@Injectable()
export class GetTimelineFeedUsecase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
    @Inject('ISocialRelationRepository')
    private readonly socialRepo: ISocialRelationRepository,
  ) {}

  async execute(viewerId: string, limit: number = 20, cursor?: string): Promise<FeedResult<PostEntity>> {
    const [matchedUserIds, swipedUserIds] = await Promise.all([
      this.socialRepo.getMatchedUserIds(viewerId),
      this.socialRepo.getSwipedRightUserIds(viewerId),
    ]);

    const decodedCursor = cursor ? KeysetCursorUtil.decode(cursor) : undefined;

    return this.postRepository.findTimelineFeed({
      viewerId,
      matchedUserIds,
      swipedUserIds,
      limit,
      cursor: decodedCursor ?? undefined,
    });
  }
}
'@
Set-Content -Path "src/use-cases/post/get-timeline-feed.usecase.ts" -Value $content -Encoding UTF8

$content = @'
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPostLikeRepository } from '../../core/abstracts/post-like-repository.abstract';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';

@Injectable()
export class ToggleLikeUsecase {
  constructor(
    @Inject('IPostLikeRepository')
    private readonly postLikeRepository: IPostLikeRepository,
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(userId: string, postId: string): Promise<{ hasLiked: boolean; likeCount: number }> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const result = await this.postLikeRepository.toggleLike(postId, userId);
    return {
      hasLiked: result.hasLiked,
      likeCount: post.likeCount + result.likeDelta,
    };
  }
}
'@
Set-Content -Path "src/use-cases/post/toggle-like.usecase.ts" -Value $content -Encoding UTF8

$content = @'
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ICommentRepository } from '../../core/abstracts/comment-repository.abstract';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';
import { CommentEntity } from '../../core/entities/comment.entity';

@Injectable()
export class CreateCommentUsecase {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(authorId: string, postId: string, content: string): Promise<CommentEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const comment = await this.commentRepository.create({ authorId, postId, content });
    await this.postRepository.incrementCommentCount(postId, 1);
    
    return comment;
  }
}
'@
Set-Content -Path "src/use-cases/post/create-comment.usecase.ts" -Value $content -Encoding UTF8

$content = @'
import { Injectable, Inject } from '@nestjs/common';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';
import { ProfileFeedResult } from '../../core/types/feed.types';
import { KeysetCursorUtil } from '../../core/utils/keyset-cursor.util';

@Injectable()
export class GetProfileFeedUsecase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(authorId: string, currentUserId: string, limit: number = 20, cursor?: string): Promise<ProfileFeedResult> {
    const decodedCursor = cursor ? KeysetCursorUtil.decode(cursor) : undefined;
    return this.postRepository.findProfileFeed(authorId, {
      limit,
      cursor: decodedCursor ?? undefined,
      currentUserId,
    });
  }
}
'@
Set-Content -Path "src/use-cases/post/get-profile-feed.usecase.ts" -Value $content -Encoding UTF8

$content = @'
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../../core/abstracts/post-repository.abstract';
import { PostEntity } from '../../core/entities/post.entity';

@Injectable()
export class GetPostDetailUsecase {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(postId: string, currentUserId: string): Promise<PostEntity> {
    const post = await this.postRepository.findById(postId, currentUserId);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
'@
Set-Content -Path "src/use-cases/post/get-post-detail.usecase.ts" -Value $content -Encoding UTF8

$content = @'
import { Injectable, Inject } from '@nestjs/common';
import { ICommentRepository } from '../../core/abstracts/comment-repository.abstract';
import { CommentEntity } from '../../core/entities/comment.entity';
import { KeysetCursorUtil } from '../../core/utils/keyset-cursor.util';

@Injectable()
export class GetCommentsUsecase {
  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(postId: string, limit: number = 20, cursor?: string): Promise<{ items: CommentEntity[]; nextCursor: string | null; hasMore: boolean }> {
    const decodedCursor = cursor ? KeysetCursorUtil.decode(cursor) : undefined;
    return this.commentRepository.findByPostId(postId, {
      limit,
      cursor: decodedCursor ? { createdAt: decodedCursor.createdAt, id: decodedCursor.id } : undefined,
    });
  }
}
'@
Set-Content -Path "src/use-cases/post/get-comments.usecase.ts" -Value $content -Encoding UTF8

$content = @'
export * from './create-post.usecase';
export * from './pin-post.usecase';
export * from './delete-post.usecase';
export * from './get-timeline-feed.usecase';
export * from './toggle-like.usecase';
export * from './create-comment.usecase';
export * from './get-profile-feed.usecase';
export * from './get-post-detail.usecase';
export * from './get-comments.usecase';
'@
Set-Content -Path "src/use-cases/post/index.ts" -Value $content -Encoding UTF8

Write-Host "Created all Usecases"
