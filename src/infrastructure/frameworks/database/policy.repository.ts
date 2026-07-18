import { Injectable } from '@nestjs/common';
import { IPolicyRepository } from '../../../core/abstracts/policy-repository.interface';
import { PrismaService } from './prisma.service';

/**
 * Prisma implementation of the policy repository.
 */
@Injectable()
export class PrismaPolicyRepository implements IPolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds a policy value by its unique key string.
   */
  async findValueByKey(key: string): Promise<string | null> {
    const policy = await this.prisma.policy.findUnique({
      where: { key },
    });
    return policy ? policy.value : null;
  }
}
