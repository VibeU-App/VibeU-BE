import { Module } from '@nestjs/common';
import { SwipeController } from './swipe.controller';
import {
  CreateSwipeUseCase,
  GetMatchesUseCase,
  GetSwipeDeckUseCase,
  UnmatchUseCase,
} from '../use-cases';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { DatabaseModule } from '../infrastructure/frameworks/database/database.module';

const USE_CASES = [
  CreateSwipeUseCase,
  GetMatchesUseCase,
  GetSwipeDeckUseCase,
  UnmatchUseCase,
];

@Module({
  imports: [DatabaseModule],
  controllers: [SwipeController],
  providers: [...USE_CASES, JwtAuthGuard],
  exports: [...USE_CASES, JwtAuthGuard],
})
export class SwipeModule {}
