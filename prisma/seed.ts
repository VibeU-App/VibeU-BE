import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is missing');
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding essential lookups...');

  // Seed Account Statuses
  const statuses = ['PENDING', 'ACTIVE', 'INACTIVE', 'TERMINATED'];
  for (const status of statuses) {
    await prisma.accountStatus.upsert({
      where: { name: status as any },
      update: {},
      create: {
        name: status as any,
      },
    });
  }
  console.log('Account statuses seeded successfully.');

  // Seed default MAX_OTP_ATTEMPTS policy
  const maxAttemptsPolicy = await prisma.policy.upsert({
    where: { key: 'MAX_OTP_ATTEMPTS' },
    update: {},
    create: {
      key: 'MAX_OTP_ATTEMPTS',
      value: '5',
    },
  });
  console.log(`MAX_OTP_ATTEMPTS policy seeded: ${maxAttemptsPolicy.value}`);

  // Seed default OTP_EXPIRY_MINUTES policy
  const expiryMinutesPolicy = await prisma.policy.upsert({
    where: { key: 'OTP_EXPIRY_MINUTES' },
    update: {},
    create: {
      key: 'OTP_EXPIRY_MINUTES',
      value: '15',
    },
  });
  console.log(`OTP_EXPIRY_MINUTES policy seeded: ${expiryMinutesPolicy.value}`);
  console.log('All essential lookups seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
