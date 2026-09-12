import request from 'supertest';
import { BaseIntegrationTest } from './helpers/base-integration-test';

class AuthIntegrationTestSuite extends BaseIntegrationTest {}

describe('Authentication Flow (Integration with Testcontainers)', () => {
  const suite = new AuthIntegrationTestSuite();

  describe('User Registration & Verification', () => {
    it('should register a new user and generate OTP in database', async () => {
      const email = 'newuser@university.edu';

      const response = await request(suite.httpServer)
        .post('/auth/register')
        .send({ email })
        .expect(201);

      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toContain('check your email');

      // Verify user is created in database with PENDING status
      const user = await suite.prisma.user.findUnique({
        where: { email },
        include: { accountStatus: true },
      });
      expect(user).not.toBeNull();
      expect(user?.accountStatus.name).toBe('PENDING');

      // Verify OTP is generated and email was captured by mock mail service
      const otp = suite.mockMailService.getLatestOtpFor(email);
      expect(otp).toBeDefined();
      expect(otp).toHaveLength(6);
    });

    it('should reject registration when email already exists and is active', async () => {
      const email = 'duplicate@university.edu';

      // 1. First registration and verification to make account ACTIVE
      await request(suite.httpServer)
        .post('/auth/register')
        .send({ email })
        .expect(201);

      const otp = suite.mockMailService.getLatestOtpFor(email);
      await request(suite.httpServer)
        .post('/auth/verify-registration')
        .send({ email, otp: otp! })
        .expect(200);

      // 2. Duplicate registration attempt with active user
      const response = await request(suite.httpServer)
        .post('/auth/register')
        .send({ email })
        .expect(409);

      expect(response.body.statusCode).toBe(409);
    });

    it('should resend new OTP when registering again with a pending account', async () => {
      const email = 'pending-resend@university.edu';

      // First registration
      await request(suite.httpServer)
        .post('/auth/register')
        .send({ email })
        .expect(201);

      const firstOtp = suite.mockMailService.getLatestOtpFor(email);
      expect(firstOtp).toBeDefined();

      // Second registration while still PENDING -> returns 201 and generates new OTP
      await request(suite.httpServer)
        .post('/auth/register')
        .send({ email })
        .expect(201);

      const secondOtp = suite.mockMailService.getLatestOtpFor(email);
      expect(secondOtp).toBeDefined();
      expect(secondOtp).not.toBe(firstOtp);
      expect(suite.mockMailService.sentMails.length).toBe(2);
    });

    it('should verify registration OTP and activate user account', async () => {
      const email = 'verify@university.edu';

      // 1. Register user
      await request(suite.httpServer)
        .post('/auth/register')
        .send({ email })
        .expect(201);

      const otp = suite.mockMailService.getLatestOtpFor(email);
      expect(otp).toBeDefined();

      // 2. Verify OTP
      const response = await request(suite.httpServer)
        .post('/auth/verify-registration')
        .send({ email, otp: otp! })
        .expect(200);

      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(email);

      // Verify user is updated to ACTIVE in database
      const user = await suite.prisma.user.findUnique({
        where: { email },
        include: { accountStatus: true },
      });
      expect(user?.accountStatus.name).toBe('ACTIVE');

      // Verify session is stored in database
      const sessions = await suite.prisma.session.findMany({
        where: { userId: user!.id },
      });
      expect(sessions.length).toBeGreaterThan(0);
    });

    it('should reject invalid verification OTP', async () => {
      const email = 'invalid-otp@university.edu';

      await request(suite.httpServer)
        .post('/auth/register')
        .send({ email })
        .expect(201);

      const response = await request(suite.httpServer)
        .post('/auth/verify-registration')
        .send({ email, otp: '000000' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('Passwordless Login & Token Refresh Flow', () => {
    it('should allow login via OTP and rotate refresh tokens', async () => {
      const email = 'login-user@university.edu';

      // Setup an active verified user
      await request(suite.httpServer)
        .post('/auth/register')
        .send({ email })
        .expect(201);
      const regOtp = suite.mockMailService.getLatestOtpFor(email);
      await request(suite.httpServer)
        .post('/auth/verify-registration')
        .send({ email, otp: regOtp! })
        .expect(200);

      suite.mockMailService.clear();

      // Request Login OTP
      await request(suite.httpServer)
        .post('/auth/request-login-otp')
        .send({ email })
        .expect(200);

      const loginOtp = suite.mockMailService.getLatestOtpFor(email);
      expect(loginOtp).toBeDefined();

      // Login with OTP
      const loginRes = await request(suite.httpServer)
        .post('/auth/login')
        .send({ email, otp: loginOtp! })
        .expect(200);

      const { accessToken, refreshToken } = loginRes.body.data;
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();

      // Refresh Tokens
      const refreshRes = await request(suite.httpServer)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.refreshToken).toBeDefined();
      expect(refreshRes.body.data.refreshToken).not.toBe(refreshToken);
    });
  });

  describe('Data Isolation & Cleanup Verification', () => {
    it('proves proper data cleanup: database is completely empty of user data at start of test', async () => {
      // Due to afterEach cleanData(), no records from previous tests should remain
      const userCount = await suite.prisma.user.count();
      const sessionCount = await suite.prisma.session.count();
      const otpCount = await suite.prisma.otp.count();

      expect(userCount).toBe(0);
      expect(sessionCount).toBe(0);
      expect(otpCount).toBe(0);

      // But baseline lookup tables remain intact
      const statusCount = await suite.prisma.accountStatus.count();
      expect(statusCount).toBe(4); // PENDING, ACTIVE, INACTIVE, TERMINATED
    });
  });
});
