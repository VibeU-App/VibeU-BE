import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Envelope } from '../core/envelope/envelope.interface';
import { RegisterRequestDto, RegisterResponseDto } from '../core/dtos/auth/register.dto';
import { LoginRequestDto, LoginResponseDto } from '../core/dtos/auth/login.dto';
import { VerifyRegistrationRequestDto, VerifyRegistrationResponseDto } from '../core/dtos/auth/verify-registration.dto';
import { ForgotPasswordRequestDto, ForgotPasswordResponseDto } from '../core/dtos/auth/forgot-password.dto';
import { VerifyResetPasswordOtpRequestDto, VerifyResetPasswordOtpResponseDto } from '../core/dtos/auth/verify-reset-password-otp.dto';
import { ResetPasswordRequestDto, ResetPasswordResponseDto } from '../core/dtos/auth/reset-password.dto';
import { RegisterUsecase } from '../use-cases/auth/register.usecase';
import { LoginUsecase } from '../use-cases/auth/login.usecase';
import { VerifyRegistrationUsecase } from '../use-cases/auth/verify-registration.usecase';
import { ForgotPasswordUsecase } from '../use-cases/auth/forgot-password.usecase';
import { VerifyResetPasswordOtpUsecase } from '../use-cases/auth/verify-reset-password-otp.usecase';
import { ResetPasswordUsecase } from '../use-cases/auth/reset-password.usecase';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly registerUsecase: RegisterUsecase,
    private readonly loginUsecase: LoginUsecase,
    private readonly verifyRegistrationUsecase: VerifyRegistrationUsecase,
    private readonly forgotPasswordUsecase: ForgotPasswordUsecase,
    private readonly verifyResetPasswordOtpUsecase: VerifyResetPasswordOtpUsecase,
    private readonly resetPasswordUsecase: ResetPasswordUsecase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterRequestDto): Promise<Envelope<RegisterResponseDto>> {
    const result = await this.registerUsecase.execute(dto.email, dto.password);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully. Please check your email for verification code.',
      data: result,
      metadata: null,
    };
  }

  @Post('verify-registration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify registration OTP' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyRegistration(@Body() dto: VerifyRegistrationRequestDto): Promise<Envelope<VerifyRegistrationResponseDto>> {
    const result = await this.verifyRegistrationUsecase.execute(dto.email, dto.otp);
    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: null,
      metadata: null,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginRequestDto): Promise<Envelope<LoginResponseDto>> {
    const result = await this.loginUsecase.execute(dto.email, dto.password);
    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: result,
      metadata: null,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiResponse({ status: 200, description: 'Reset code sent if email exists' })
  async forgotPassword(@Body() dto: ForgotPasswordRequestDto): Promise<Envelope<ForgotPasswordResponseDto>> {
    const result = await this.forgotPasswordUsecase.execute(dto.email);

    return {
      statusCode: 200,
      message: "OK",
      data: {
        message: result.message,
      },
      metadata: {
        timestamp: new Date().toISOString()
      },
    }
  }

  @Post('verify-reset-password-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify reset OTP and get reset token' })
  @ApiResponse({ status: 200, description: 'Reset token generated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyResetOtp(@Body() dto: VerifyResetPasswordOtpRequestDto): Promise<Envelope<VerifyResetPasswordOtpResponseDto>> {
    const result = await this.verifyResetPasswordOtpUsecase.execute(dto.email, dto.otp);
    
    return {
      statusCode: 200,
      message: "OK",
      data: {
        resetToken: result.resetToken
      },
      metadata: {
        timestamp: new Date().toISOString()
      },
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with reset token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() dto: ResetPasswordRequestDto): Promise<Envelope<ResetPasswordResponseDto>> {
    const result = await this.resetPasswordUsecase.execute(dto.newPassword, dto.resetToken);
    
    return {
      statusCode: 200,
      message: "OK",
      data: {
        message: result.message,
      },
      metadata: {
        timestamp: new Date().toISOString()
      },
    }
  }
}
