import { describe, it } from 'node:test';
import assert from 'node:assert';
import { databaseHealthCheck } from '../../src/config/database.js';
import { formatPrismaError, isPrismaError } from '../../src/utils/prismaErrors.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

describe('Database Infrastructure Unit Tests', () => {
  it('should return connected status from databaseHealthCheck()', async () => {
    const health = await databaseHealthCheck();
    assert.strictEqual(typeof health.connected, 'boolean');
    assert.strictEqual(health.connected, true);
    assert.ok(health.timestamp);
    assert.ok(typeof health.latencyMs === 'number');
  });

  it('should correctly format Prisma P2002 unique constraint error', () => {
    const p2002Error = new PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '7.8.0',
      meta: { target: ['email'] },
    });

    assert.strictEqual(isPrismaError(p2002Error), true);

    const formatted = formatPrismaError(p2002Error);
    assert.strictEqual(formatted.statusCode, 409);
    assert.strictEqual(formatted.code, 'UNIQUE_CONSTRAINT_VIOLATION');
    assert.ok(formatted.message.includes('email'));
  });

  it('should correctly format Prisma P2025 record not found error', () => {
    const p2025Error = new PrismaClientKnownRequestError('Record to update not found.', {
      code: 'P2025',
      clientVersion: '7.8.0',
      meta: { cause: 'Record to update not found.' },
    });

    const formatted = formatPrismaError(p2025Error);
    assert.strictEqual(formatted.statusCode, 404);
    assert.strictEqual(formatted.code, 'RECORD_NOT_FOUND');
  });
});
