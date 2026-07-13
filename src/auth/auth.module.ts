import { Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { RegisterUsecase } from '../use-cases/auth/register.usecase';
import { LoginUsecase } from '../use-cases/auth/login.usecase';
import { VerifyRegistrationUsecase } from '../use-cases/auth/verify-registration.usecase';
import { ForgotPasswordUsecase } from '../use-cases/auth/forgot-password.usecase';
import { VerifyOtpUsecase } from '../use-cases/auth/verify-otp.usecase';
import { ResetPasswordUsecase } from '../use-cases/auth/reset-password.usecase';
import { Argon2Service } from '../services/crypto/argon2.service';
import { SmtpMailService } from '../services/mail/smtp.service';
import { OtpCacheService } from '../services/otp/otp-cache.service';
import { JwtService } from '../services/token/jwt.service';
import { TemplateLoaderService } from '../services/template/template-loader.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    // Use cases
    RegisterUsecase,
    LoginUsecase,
    VerifyRegistrationUsecase,
    ForgotPasswordUsecase,
    VerifyOtpUsecase,
    ResetPasswordUsecase,
    
    // Services
    TemplateLoaderService,
    {
      provide: 'ICryptoService',
      useClass: Argon2Service,
    },
    {
      provide: 'IMailService',
      useClass: SmtpMailService,
    },
    {
      provide: 'IOtpService',
      useClass: OtpCacheService,
    },
    {
      provide: 'IJwtService',
      useClass: JwtService,
    },
  ],
  exports: [
    RegisterUsecase,
    LoginUsecase,
    VerifyRegistrationUsecase,
    ForgotPasswordUsecase,
    VerifyOtpUsecase,
    ResetPasswordUsecase,
  ],
})
export class AuthModule {}
