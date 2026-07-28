import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';

describe('Global Infrastructure Integration Tests', () => {
  it('should respond to GET /health with 200 and standard success response', async () => {
    // Basic test using node's fetch or server request
    const server = app.listen(0);
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    try {
      const res = await fetch(`http://localhost:${port}/health`);
      assert.equal(res.status, 200);

      const json = (await res.json()) as {
        success: boolean;
        message: string;
        data: { status: string; database: string };
      };

      assert.equal(json.success, true);
      assert.equal(json.data.status, 'healthy');
      assert.equal(json.data.database, 'connected');

      // Check request ID header
      const requestIdHeader = res.headers.get('x-request-id');
      assert.ok(requestIdHeader);
      assert.ok(requestIdHeader.length > 10);
    } finally {
      server.close();
    }
  });

  it('should respond to unknown route with standard 404 JSON', async () => {
    const server = app.listen(0);
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    try {
      const res = await fetch(`http://localhost:${port}/unknown-route-xyz`);
      assert.equal(res.status, 404);

      const json = (await res.json()) as {
        success: boolean;
        message: string;
        error: { code: string };
      };

      assert.equal(json.success, false);
      assert.equal(json.error.code, 'ROUTE_NOT_FOUND');
    } finally {
      server.close();
    }
  });

  it('should include Helmet security headers in response', async () => {
    const server = app.listen(0);
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    try {
      const res = await fetch(`http://localhost:${port}/health`);
      assert.ok(res.headers.get('x-content-type-options'));
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    } finally {
      server.close();
    }
  });
});
