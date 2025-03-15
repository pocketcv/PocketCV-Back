import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Try to query the users table
    const users = await prisma.user.findMany();
    console.log('Successfully connected to database!');
    console.log('Number of users:', users.length);
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
