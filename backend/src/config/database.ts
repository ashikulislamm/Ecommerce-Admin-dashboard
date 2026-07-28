import prisma from '../lib/prisma.js';

export interface DatabaseHealthStatus {
  connected: boolean;
  timestamp: string;
  latencyMs?: number;
  error?: string;
}

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL database:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected cleanly');
  } catch (error) {
    console.error('⚠️ Error disconnecting database:', error);
  }
};

export const databaseHealthCheck = async (): Promise<DatabaseHealthStatus> => {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;
    return {
      connected: true,
      timestamp: new Date().toISOString(),
      latencyMs,
    };
  } catch (error) {
    return {
      connected: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Database check failed',
    };
  }
};