import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './user.repository';
import { PrismaSessionRepository } from './session.repository';
import { PrismaPolicyRepository } from './policy.repository';
import { PrismaOtpRepository } from './otp.repository';
import { PrismaProfileRepository } from './profile.repository';
import { PrismaHobbyRepository } from './hobby.repository';
import { PrismaPersonalityArchetypeRepository } from './personality-archetype.repository';
import { PrismaQuestionnaireRepository } from './questionnaire.repository';
import { AccountStatusLoaderService } from './account-status-loader.service';
import { DatabasePrewarmService } from './database-prewarm.service';

/**
 * Database module for VibeU.
 *
 * Consolidates repositories and database services under a single module.
 * Exports repository interfaces (tokens) to adhere to Dependency Inversion Principle.
 */
@Module({
  providers: [
    PrismaService,
    PrismaUserRepository,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    PrismaSessionRepository,
    {
      provide: 'ISessionRepository',
      useClass: PrismaSessionRepository,
    },
    PrismaPolicyRepository,
    {
      provide: 'IPolicyRepository',
      useClass: PrismaPolicyRepository,
    },
    PrismaOtpRepository,
    {
      provide: 'IOtpRepository',
      useClass: PrismaOtpRepository,
    },
    PrismaProfileRepository,
    {
      provide: 'IProfileRepository',
      useClass: PrismaProfileRepository,
    },
    PrismaHobbyRepository,
    {
      provide: 'IHobbyRepository',
      useClass: PrismaHobbyRepository,
    },
    PrismaPersonalityArchetypeRepository,
    {
      provide: 'IPersonalityArchetypeRepository',
      useClass: PrismaPersonalityArchetypeRepository,
    },
    PrismaQuestionnaireRepository,
    {
      provide: 'IQuestionnaireRepository',
      useClass: PrismaQuestionnaireRepository,
    },
    AccountStatusLoaderService,
    DatabasePrewarmService,
  ],
  exports: [
    'IUserRepository',
    'ISessionRepository',
    'IPolicyRepository',
    'IOtpRepository',
    'IProfileRepository',
    'IHobbyRepository',
    'IPersonalityArchetypeRepository',
    'IQuestionnaireRepository',
    AccountStatusLoaderService,
    DatabasePrewarmService,
  ],
})
export class DatabaseModule {}
