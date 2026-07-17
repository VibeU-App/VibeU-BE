import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegisterUsecase } from '../use-cases/auth/register.usecase';
import { LoginUsecase } from '../use-cases/auth/login.usecase';
import { VerifyRegistrationUsecase } from '../use-cases/auth/verify-registration.usecase';
import { ForgotPasswordUsecase } from '../use-cases/auth/forgot-password.usecase';
import { VerifyResetPasswordOtpUsecase } from '../use-cases/auth/verify-reset-password-otp.usecase';
import { ResetPasswordUsecase } from '../use-cases/auth/reset-password.usecase';
import { PostgresModule } from '../infrastructure/frameworks/database/postgres/postgres.module';

@Module({
  imports: [PostgresModule],
  controllers: [AuthController],
  providers: [
    // Use cases
    RegisterUsecase,
    LoginUsecase,
    VerifyRegistrationUsecase,
    ForgotPasswordUsecase,
    VerifyResetPasswordOtpUsecase,
    ResetPasswordUsecase,
  ],
  exports: [
    RegisterUsecase,
    LoginUsecase,
    VerifyRegistrationUsecase,
    ForgotPasswordUsecase,
    VerifyResetPasswordOtpUsecase,
    ResetPasswordUsecase,
  ],
})
export class AuthModule {}
