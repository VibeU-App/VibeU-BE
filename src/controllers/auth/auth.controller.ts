import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegisterDto } from '../../dtos/auth/register.dto';
import { LoginDto } from '../../dtos/auth/login.dto';
import { VerifyOtpDto } from '../../dtos/auth/verify-otp.dto';
import { VerifyRegistrationDto } from '../../dtos/auth/verify-registration.dto';
import { ResetPasswordDto } from '../../dtos/auth/reset-password.dto';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  // TODO: Inject usecases via constructor

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto): Promise<any> {
    // TODO: Implement - delegate to RegisterUsecase
    throw new Error('Not implemented');
  }

  @Post('verify-registration')
  @ApiOperation({ summary: 'Verify registration OTP' })
  async verifyRegistration(@Body() dto: VerifyRegistrationDto): Promise<any> {
    // TODO: Implement - delegate to VerifyRegistrationUsecase
    throw new Error('Not implemented');
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() dto: LoginDto): Promise<any> {
    // TODO: Implement - delegate to LoginUsecase
    throw new Error('Not implemented');
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset OTP' })
  async forgotPassword(@Body() body: { email: string }): Promise<any> {
    // TODO: Implement - delegate to ForgotPasswordUsecase
    throw new Error('Not implemented');
  }

  @Post('verify-reset-otp')
  @ApiOperation({ summary: 'Verify reset OTP and get reset token' })
  async verifyResetOtp(@Body() dto: VerifyOtpDto): Promise<any> {
    // TODO: Implement - delegate to VerifyOtpUsecase
    throw new Error('Not implemented');
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with reset token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<any> {
    // TODO: Implement - delegate to ResetPasswordUsecase
    throw new Error('Not implemented');
  }
}