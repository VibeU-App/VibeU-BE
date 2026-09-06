import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import {
  SaveBasicProfileUseCase,
  SaveHobbiesUseCase,
  SubmitQuestionnaireUseCase,
  GetProfileUseCase,
} from '../use-cases';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { DatabaseModule } from '../infrastructure/frameworks/database/database.module';

const USE_CASES = [
  SaveBasicProfileUseCase,
  SaveHobbiesUseCase,
  SubmitQuestionnaireUseCase,
  GetProfileUseCase,
];

@Module({
  imports: [DatabaseModule],
  controllers: [ProfileController],
  providers: [...USE_CASES, JwtAuthGuard],
  exports: [...USE_CASES, JwtAuthGuard],
})
export class ProfileModule {}
