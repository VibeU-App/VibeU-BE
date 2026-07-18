import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegisterUsecase } from '../use-cases/auth/register.usecase';
import { LoginUsecase } from '../use-cases/auth/login.usecase';
import { VerifyRegistrationUsecase } from '../use-cases/auth/verify-registration.usecase';
import { ForgotPasswordUsecase } from '../use-cases/auth/forgot-password.usecase';
import { VerifyResetPasswordOtpUsecase } from '../use-cases/auth/verify-reset-password-otp.usecase';
import { ResetPasswordUsecase } from '../use-cases/auth/reset-password.usecase';
import { RefreshUsecase } from '../use-cases/auth/refresh.usecase';
import { CreatePasswordUsecase } from '../use-cases/auth/create-password.usecase';
import { ChangePasswordUsecase } from '../use-cases/auth/change-password.usecase';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { DatabaseModule } from '../infrastructure/frameworks/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    // Use cases
    RegisterUsecase,
    LoginUsecase,
    VerifyRegistrationUsecase,
    ForgotPasswordUsecase,
    VerifyResetPasswordOtpUsecase,
    ResetPasswordUsecase,
    RefreshUsecase,
    CreatePasswordUsecase,
    ChangePasswordUsecase,
    JwtAuthGuard,
  ],
  exports: [
    RegisterUsecase,
    LoginUsecase,
    VerifyRegistrationUsecase,
    ForgotPasswordUsecase,
    VerifyResetPasswordOtpUsecase,
    ResetPasswordUsecase,
    RefreshUsecase,
    CreatePasswordUsecase,
    ChangePasswordUsecase,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
