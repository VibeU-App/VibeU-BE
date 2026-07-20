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

  // Seed Hobbies
  console.log('Seeding hobbies...');
  const hobbies = [
    { name: 'Introverted', category: 'PERSONALITY' },
    { name: 'Extroverted', category: 'PERSONALITY' },
    { name: 'Eccentric', category: 'PERSONALITY' },
    { name: 'Rational', category: 'PERSONALITY' },
    { name: 'Direct', category: 'COMMUNICATION_STYLE' },
    { name: 'Empathetic', category: 'COMMUNICATION_STYLE' },
    { name: 'Humorous', category: 'COMMUNICATION_STYLE' },
    { name: 'Quiet', category: 'COMMUNICATION_STYLE' },
    { name: 'Soccer', category: 'SPORT' },
    { name: 'Basketball', category: 'SPORT' },
    { name: 'Tennis', category: 'SPORT' },
    { name: 'Gym', category: 'SPORT' },
    { name: 'Dogs', category: 'PET' },
    { name: 'Cats', category: 'PET' },
    { name: 'Birds', category: 'PET' },
    { name: 'Pizza', category: 'FOOD' },
    { name: 'Sushi', category: 'FOOD' },
    { name: 'Bánh Mì', category: 'FOOD' },
  ];
  for (const hobby of hobbies) {
    await prisma.hobby.upsert({
      where: { name: hobby.name },
      update: { category: hobby.category },
      create: hobby,
    });
  }
  console.log('Hobbies seeded successfully.');

  // Seed Personality Archetypes
  console.log('Seeding personality archetypes...');
  const archetypes = [
    {
      name: 'Lotus',
      description: 'Calm, thoughtful, and deeply intuitive.',
      traits: ['Empathetic', 'Quiet', 'Rational'],
    },
    {
      name: 'The Adventurous Innovator',
      description: 'Enthusiastic explorer of new ideas and landscapes.',
      traits: ['Curious', 'Bold', 'Eccentric'],
    },
    {
      name: 'The Social Dynamo',
      description: 'Brings energy to any group and loves connecting people.',
      traits: ['Outgoing', 'Humorous', 'Extroverted'],
    },
  ];
  for (const arch of archetypes) {
    await prisma.personalityArchetype.upsert({
      where: { name: arch.name },
      update: {
        description: arch.description,
        traits: arch.traits,
      },
      create: arch,
    });
  }
  console.log('Personality archetypes seeded successfully.');

  // Seed Questionnaire Questions & Options
  console.log('Seeding questionnaire...');
  const questions = [
    {
      text: 'Which team will win the World Cup 2026?',
      order: 1,
      options: ['Argentina', 'Brazil', 'France', 'England'],
    },
    {
      text: 'What is your favorite weekend activity?',
      order: 2,
      options: ['Reading at home', 'Hiking outdoors', 'Partying with friends', 'Playing video games'],
    },
    {
      text: 'How do you handle conflict?',
      order: 3,
      options: ['Address it directly', 'Talk it out calmly', 'Avoid it and move on', 'Ask a friend for help'],
    },
    {
      text: 'Choose a favorite season',
      order: 4,
      options: ['Spring', 'Summer', 'Autumn', 'Winter'],
    },
    {
      text: 'What drives you the most?',
      order: 5,
      options: ['Knowledge', 'Adventure', 'Creativity', 'Stability'],
    },
  ];

  for (const q of questions) {
    // Check if question text already exists
    let questionRecord = await prisma.questionnaireQuestion.findFirst({
      where: { text: q.text },
    });

    if (!questionRecord) {
      questionRecord = await prisma.questionnaireQuestion.create({
        data: {
          text: q.text,
          order: q.order,
        },
      });
    }

    // Seed options
    for (const optText of q.options) {
      const optRecord = await prisma.questionnaireOption.findFirst({
        where: {
          questionId: questionRecord.id,
          text: optText,
        },
      });

      if (!optRecord) {
        await prisma.questionnaireOption.create({
          data: {
            questionId: questionRecord.id,
            text: optText,
          },
        });
      }
    }
  }

  console.log('Questionnaire seeded successfully.');
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
