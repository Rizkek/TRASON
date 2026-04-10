import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger.js';

let prisma: PrismaClient;

declare global {
  var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: process.env.LOG_LEVEL === 'debug' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    });
  }
  prisma = global.prisma;
}

prisma.$connect()
  .then(() => {
    logger.info('✅ Database connected successfully');
  })
  .catch((error: Error) => {
    logger.error('❌ Database connection error', error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down, disconnecting database...');
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
