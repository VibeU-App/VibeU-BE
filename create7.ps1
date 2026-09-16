$content = @'
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  ApiOkResponseEnvelope,
  ApiCreatedResponseEnvelope,
  ApiOkResponseEnvelopeNull,
} from '../core/envelope/envelope.decorator';
import { Envelope } from '../core/envelope/envelope.interface';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { CurrentUser } from '../middleware/current-user.decorator';
import { TokenPayload } from '../middleware/token-payload.interface';
import { RolesGuard } from '../middleware/roles.guard';

import {
  CreatePostDto,
  PinPostDto,
  TimelineFeedQueryDto,
  CreateCommentDto,
  ProfileFeedQueryDto,
} from './dto/post';

import {
  CreatePostUsecase,
  PinPostUsecase,
  DeletePostUsecase,
  GetTimelineFeedUsecase,
  ToggleLikeUsecase,
  CreateCommentUsecase,
  GetProfileFeedUsecase,
  GetPostDetailUsecase,
  GetCommentsUsecase,
} from '../use-cases';

import { PostEntity } from '../core/entities/post.entity';
import { CommentEntity } from '../core/entities/comment.entity';
import { FeedResult, ProfileFeedResult } from '../core/types/feed.types';

@ApiTags('Posts')
@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PostController {
  constructor(
    private readonly createPostUsecase: CreatePostUsecase,
    private readonly pinPostUsecase: PinPostUsecase,
    private readonly deletePostUsecase: DeletePostUsecase,
    private readonly getTimelineFeedUsecase: GetTimelineFeedUsecase,
    private readonly toggleLikeUsecase: ToggleLikeUsecase,
    private readonly createCommentUsecase: CreateCommentUsecase,
    private readonly getProfileFeedUsecase: GetProfileFeedUsecase,
    private readonly getPostDetailUsecase: GetPostDetailUsecase,
    private readonly getCommentsUsecase: GetCommentsUsecase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiCreatedResponseEnvelope(PostEntity, { description: 'Post created successfully' })
  async createPost(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: TokenPayload,
  ): Promise<Envelope<PostEntity>> {
    const post = await this.createPostUsecase.execute(user.sub, dto.content, dto.mediaUrls);
    return { data: post, statusCode: HttpStatus.CREATED, message: 'Post created successfully', metadata: null };
  }

  @Patch(':id/pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pin or unpin a post' })
  async pinPost(
    @Param('id') id: string,
    @Body() dto: PinPostDto,
    @CurrentUser() user: TokenPayload,
  ): Promise<Envelope<{ id: string; isPinned: boolean; updatedAt: Date }>> {
    const post = await this.pinPostUsecase.execute(user.sub, id, dto.isPinned);
    return {
      data: { id: post.id, isPinned: post.isPinned, updatedAt: post.updatedAt },
      statusCode: HttpStatus.OK,
      message: 'Post pin status updated successfully',
      metadata: null,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a post' })
  @ApiOkResponseEnvelopeNull({ description: 'Post deleted successfully' })
  async deletePost(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Envelope<null>> {
    await this.deletePostUsecase.execute(user.sub, id);
    return { data: null, statusCode: HttpStatus.OK, message: 'Post deleted successfully', metadata: null };
  }

  @Get('timeline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get timeline feed' })
  async getTimelineFeed(
    @Query() query: TimelineFeedQueryDto,
    @CurrentUser() user: TokenPayload,
  ): Promise<Envelope<FeedResult<PostEntity>>> {
    const result = await this.getTimelineFeedUsecase.execute(user.sub, query.limit, query.cursor);
    return { data: result, statusCode: HttpStatus.OK, message: 'Timeline feed retrieved successfully', metadata: null };
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle like on post' })
  async toggleLike(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Envelope<{ postId: string; hasLiked: boolean; likeCount: number }>> {
    const result = await this.toggleLikeUsecase.execute(user.sub, id);
    return {
      data: { postId: id, hasLiked: result.hasLiked, likeCount: result.likeCount },
      statusCode: HttpStatus.OK,
      message: 'Post like toggled successfully',
      metadata: null,
    };
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a post' })
  async addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: TokenPayload,
  ): Promise<Envelope<CommentEntity>> {
    const comment = await this.createCommentUsecase.execute(user.sub, id, dto.content);
    return { data: comment, statusCode: HttpStatus.CREATED, message: 'Comment added successfully', metadata: null };
  }

  @Get('profile/:authorId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user profile feed' })
  async getProfileFeed(
    @Param('authorId') authorId: string,
    @Query() query: ProfileFeedQueryDto,
    @CurrentUser() user: TokenPayload,
  ): Promise<Envelope<ProfileFeedResult>> {
    const result = await this.getProfileFeedUsecase.execute(authorId, user.sub, query.limit, query.cursor);
    return { data: result, statusCode: HttpStatus.OK, message: 'Profile feed retrieved successfully', metadata: null };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get post details' })
  async getPostDetails(
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<Envelope<PostEntity>> {
    const post = await this.getPostDetailUsecase.execute(id, user.sub);
    return { data: post, statusCode: HttpStatus.OK, message: 'Post retrieved successfully', metadata: null };
  }

  @Get(':id/comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List comments for post' })
  async getComments(
    @Param('id') id: string,
    @Query('limit') limitStr: string,
    @Query('cursor') cursor?: string,
  ): Promise<Envelope<{ items: CommentEntity[]; nextCursor: string | null; hasMore: boolean }>> {
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const result = await this.getCommentsUsecase.execute(id, limit, cursor);
    return { data: result, statusCode: HttpStatus.OK, message: 'Comments retrieved successfully', metadata: null };
  }
}
'@
Set-Content -Path "src/controllers/post.controller.ts" -Value $content -Encoding UTF8
