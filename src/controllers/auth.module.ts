import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import {
  RegisterUsecase,
  LoginUsecase,
  VerifyRegistrationUsecase,
  ForgotPasswordUsecase,
  VerifyResetPasswordOtpUsecase,
  ResetPasswordUsecase,
  RefreshUsecase,
  CreatePasswordUsecase,
  ChangePasswordUsecase,
  RequestLoginOtpUsecase,
  CleanExpiredOtpsUsecase,
} from '../use-cases';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { DatabaseModule } from '../infrastructure/frameworks/database/database.module';

const USE_CASES = [
  RegisterUsecase,
  LoginUsecase,
  VerifyRegistrationUsecase,
  ForgotPasswordUsecase,
  VerifyResetPasswordOtpUsecase,
  ResetPasswordUsecase,
  RefreshUsecase,
  CreatePasswordUsecase,
  ChangePasswordUsecase,
  RequestLoginOtpUsecase,
  CleanExpiredOtpsUsecase,
];

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [...USE_CASES, JwtAuthGuard],
  exports: [...USE_CASES, JwtAuthGuard],
})
export class AuthModule {}
