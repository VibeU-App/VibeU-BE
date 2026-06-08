import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  // TODO: Inject usecases via constructor

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() body: { email: string; password: string }): Promise<any> {
    // TODO: Implement - delegate to RegisterUsecase
    throw new Error('Not implemented');
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() body: { email: string; password: string }): Promise<any> {
    // TODO: Implement - delegate to LoginUsecase
    throw new Error('Not implemented');
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset OTP' })
  async forgotPassword(@Body() body: { email: string }): Promise<any> {
    // TODO: Implement - delegate to ForgotPasswordUsecase
    throw new Error('Not implemented');
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and get reset token' })
  async verifyOtp(@Body() body: { email: string; otp: string }): Promise<any> {
    // TODO: Implement - delegate to VerifyOtpUsecase
    throw new Error('Not implemented');
  }
}