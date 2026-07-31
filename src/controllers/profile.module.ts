import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { DatabaseModule } from '../infrastructure/frameworks/database/database.module';

// Use cases
import { SaveBasicProfileUseCase } from '../use-cases/profile/save-basic-profile.usecase';
import { SaveHobbiesUseCase } from '../use-cases/profile/save-hobbies.usecase';
import { SubmitQuestionnaireUseCase } from '../use-cases/profile/submit-questionnaire.usecase';
import { GetProfileUseCase } from '../use-cases/profile/get-profile.usecase';

// Guards
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [ProfileController],
  providers: [
    SaveBasicProfileUseCase,
    SaveHobbiesUseCase,
    SubmitQuestionnaireUseCase,
    GetProfileUseCase,
    JwtAuthGuard,
  ],
  exports: [
    SaveBasicProfileUseCase,
    SaveHobbiesUseCase,
    SubmitQuestionnaireUseCase,
    GetProfileUseCase,
    JwtAuthGuard,
  ],
})
export class ProfileModule {}
