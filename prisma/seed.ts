import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let client: Client;
let prisma: PrismaClient;

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DIRECT_URL or DATABASE_URL environment variable is missing.');
  }

  client = new Client({ connectionString });
  await client.connect();
  const adapter = new PrismaPg(client);
  prisma = new PrismaClient({ adapter });

  console.log('Seeding policies...');

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
  console.log('Seeding completed successfully.');
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
    if (client) {
      await client.end();
    }
  });
