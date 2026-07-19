import { CleanExpiredOtpsUsecase } from './clean-expired-otps.usecase';
import { MockOtpRepository } from './test-mocks';
import { OtpEntity } from '../../core/entities';

describe('CleanExpiredOtpsUsecase', () => {
  let usecase: CleanExpiredOtpsUsecase;
  let mockOtpRepository: MockOtpRepository;

  beforeEach(() => {
    mockOtpRepository = new MockOtpRepository();
    usecase = new CleanExpiredOtpsUsecase(mockOtpRepository);
  });

  afterEach(() => {
    mockOtpRepository.clear();
  });

  it('should successfully delete expired OTPs and return deleted count', async () => {
    const expiredOtp = OtpEntity.create({
      userId: 'user-1',
      code: '111111',
      expiryMinutes: -5, // Expired 5 minutes ago
    });
    const activeOtp = OtpEntity.create({
      userId: 'user-2',
      code: '222222',
      expiryMinutes: 15, // Active
    });

    await mockOtpRepository.save(expiredOtp);
    await mockOtpRepository.save(activeOtp);

    const deletedCount = await usecase.execute();

    expect(deletedCount).toBe(1);

    // Verify expired OTP is deleted and active OTP remains
    expect(await mockOtpRepository.findByUserId('user-1')).toBeNull();
    expect(await mockOtpRepository.findByUserId('user-2')).not.toBeNull();
  });
});
