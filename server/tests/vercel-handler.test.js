import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/config/database.js', () => ({
  connectDatabase: vi.fn(),
}));

import handler from '../api/[...path].js';
import { connectDatabase } from '../src/config/database.js';

const originalMongoUri = process.env.MONGODB_URI;

describe('Vercel API handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDatabase.mockResolvedValue(undefined);
    process.env.MONGODB_URI = 'mongodb://localhost:27017/leadflow-test';
  });

  afterEach(() => {
    if (originalMongoUri === undefined) {
      delete process.env.MONGODB_URI;
    } else {
      process.env.MONGODB_URI = originalMongoUri;
    }
  });

  it('connects to MongoDB and serves API routes', async () => {
    await request((req, res) => handler(req, res))
      .get('/api/health')
      .expect(200, { success: true, status: 'ok' });

    expect(connectDatabase).toHaveBeenCalledWith(process.env.MONGODB_URI);
  });
});
