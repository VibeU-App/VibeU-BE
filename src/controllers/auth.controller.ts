import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Envelope } from '../core/envelope/envelope.interface';
import { RegisterRequestDto, RegisterResponseDto } from '../core/dtos/auth/register.dto';
import { LoginRequestDto, LoginResponseDto } from '../core/dtos/auth/login.dto';
import { VerifyRegistrationRequestDto, VerifyRegistrationResponseDto } from '../core/dtos/auth/verify-registration.dto';
import { ForgotPasswordRequestDto, ForgotPasswordResponseDto } from '../core/dtos/auth/forgot-password.dto';
import { VerifyOtpRequestDto, VerifyOtpResponseDto } from '../core/dtos/auth/verify-otp.dto';
import { ResetPasswordRequestDto, ResetPasswordResponseDto } from '../core/dtos/auth/reset-password.dto';
import { ForgotPasswordUsecase } from '../use-cases/auth/forgot-password.usecase';
import { VerifyOtpUsecase } from '../use-cases/auth/verify-otp.usecase';
import { ResetPasswordUsecase } from '../use-cases/auth/reset-password.usecase';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly forgotPasswordUsecase: ForgotPasswordUsecase,
    private readonly verifyOtpUsecase: VerifyOtpUsecase,
    private readonly resetPasswordUsecase: ResetPasswordUsecase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterRequestDto): Promise<Envelope<RegisterResponseDto>> {
    // TODO: Implement - delegate to RegisterUsecase
    throw new Error('Not implemented');
  }

  @Post('verify-registration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify registration OTP' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyRegistration(@Body() dto: VerifyRegistrationRequestDto): Promise<Envelope<VerifyRegistrationResponseDto>> {
    // TODO: Implement - delegate to VerifyRegistrationUsecase
    throw new Error('Not implemented');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginRequestDto): Promise<Envelope<LoginResponseDto>> {
    // TODO: Implement - delegate to LoginUsecase
    throw new Error('Not implemented');
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

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify reset OTP and get reset token' })
  @ApiResponse({ status: 200, description: 'Reset token generated' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyResetOtp(@Body() dto: VerifyOtpRequestDto): Promise<Envelope<VerifyOtpResponseDto>> {
    const result = await this.verifyOtpUsecase.execute(dto.email, dto.otp);
    
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
