import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { DatabaseModule } from '../infrastructure/frameworks/database/database.module';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RolesGuard } from '../middleware/roles.guard';

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

const USE_CASES = [
  CreatePostUsecase,
  PinPostUsecase,
  DeletePostUsecase,
  GetTimelineFeedUsecase,
  ToggleLikeUsecase,
  CreateCommentUsecase,
  GetProfileFeedUsecase,
  GetPostDetailUsecase,
  GetCommentsUsecase,
];

@Module({
  imports: [DatabaseModule],
  controllers: [PostController],
  providers: [...USE_CASES, JwtAuthGuard, RolesGuard],
  exports: [...USE_CASES, JwtAuthGuard, RolesGuard],
})
export class PostModule {}
